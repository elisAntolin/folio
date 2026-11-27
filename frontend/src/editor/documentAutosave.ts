import { ApiError, type ContentRevision, type PageContent } from "../api.ts";
import type { DocumentContent } from "../components/BlockEditor/schema";
import type { DocumentDraft, PendingWrite, SaveStatus } from "./documentDrafts";

export interface AutosaveIO {
  load: () => Promise<PageContent>;
  save: (content: DocumentContent, version: number) => Promise<ContentRevision>;
  writeDraft: (draft: DocumentDraft) => Promise<void>;
  removeDraft: (draft: DocumentDraft) => Promise<void>;
  online: () => boolean;
}

export interface AutosaveState {
  status: SaveStatus;
  draftError: boolean;
  server?: PageContent;
  failureMessage?: string;
}

const activeSaves = new Map<string, Promise<void>>();

function documentKey(userId: string, pageId: string) {
  return JSON.stringify([userId, pageId]);
}

export async function waitForDocumentSave(userId: string, pageId: string) {
  await activeSaves.get(documentKey(userId, pageId));
}

function sameContent(first: DocumentContent, second: DocumentContent) {
  // JSONB does not preserve the order of object keys.
  function ordered(_key: string, value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
  }
  return first === second || JSON.stringify(first, ordered) === JSON.stringify(second, ordered);
}

function isTemporary(error: unknown) {
  return error instanceof ApiError
    ? error.status >= 500 || error.status === 408 || error.status === 429
    : error instanceof TypeError || error instanceof SyntaxError
      || (error instanceof DOMException && error.name === "TimeoutError");
}

export class DocumentAutosave {
  private readonly userId: string;
  private readonly pageId: string;
  private readonly io: AutosaveIO;
  private readonly notify: (state: AutosaveState) => void;
  private readonly id = crypto.randomUUID();
  private state: AutosaveState = { status: "saved", draftError: false };
  private version: number;
  private confirmed?: DocumentContent;
  private draft?: DocumentDraft;
  private pendingWrite?: PendingWrite;
  private timer?: ReturnType<typeof setTimeout>;
  private firstChange?: number;
  private latestChange = 0;
  private failures = 0;
  private retryAt = 0;
  private stopped = false;
  private saving = false;
  private blocked = false;

  constructor(
    userId: string, pageId: string, remote: PageContent | undefined,
    recovered: DocumentDraft | undefined, io: AutosaveIO, notify: (state: AutosaveState) => void,
  ) {
    this.userId = userId;
    this.pageId = pageId;
    this.io = io;
    this.notify = notify;
    this.version = recovered?.version ?? remote?.version ?? 1;
    this.confirmed = remote?.content;
    if (recovered) {
      this.draft = recovered;
      this.pendingWrite = recovered.pendingWrite;
      if (remote) this.reconcile(remote, true);
      if (this.draft) {
        // A different tab may still be using the recovered draft.
        this.draft = { ...this.draft, id: this.id };
        void this.persist().then((written) => {
          if (written) this.remove(recovered);
        });
      }
    }
  }

  start() {
    if (this.draft && !this.blocked) this.resume();
    else this.notify(this.state);
  }

  change(content: DocumentContent) {
    if (this.stopped || sameContent(content, this.draft?.content ?? this.confirmed ?? [])) return;

    const previous = this.draft;
    this.latestChange = Date.now();
    this.firstChange ??= this.latestChange;
    this.draft = {
      userId: this.userId, pageId: this.pageId, id: this.id,
      content, version: this.version, revision: crypto.randomUUID(),
      modifiedAt: this.latestChange, status: this.state.status,
      pendingWrite: this.pendingWrite,
    };

    if (!this.saving && !this.blocked && !this.pendingWrite && this.confirmed
        && sameContent(content, this.confirmed)) {
      this.draft = undefined;
      this.cancelTimer();
      this.firstChange = undefined;
      if (previous) this.remove(previous);
      this.setStatus("saved");
      return;
    }

    if (!this.blocked && !this.saving) this.setStatus(this.io.online() ? "unsaved" : "offline");
    void this.persist();
    if (this.failures === 0) this.schedule();
  }

  private persist(): Promise<boolean> {
    if (!this.draft) return Promise.resolve(false);
    this.draft = { ...this.draft, version: this.version, status: this.state.status, pendingWrite: this.pendingWrite };
    return this.io.writeDraft(this.draft).then(() => {
      if (this.state.draftError) this.publish({ draftError: false });
      return true;
    }, () => {
      this.publish({ draftError: true });
      return false;
    });
  }

  private remove(draft: DocumentDraft) {
    void this.io.removeDraft(draft).catch(() => this.publish({ draftError: true }));
  }

  private publish(update: Partial<AutosaveState>) {
    this.state = { ...this.state, ...update };
    if (!this.stopped) this.notify(this.state);
  }

  private setStatus(status: SaveStatus) {
    if (this.state.status !== status) this.publish({ status });
  }

  private cancelTimer() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  private schedule() {
    if (!this.draft || this.stopped || this.blocked || this.saving || !this.io.online()) return;
    this.cancelTimer();
    const due = Math.min(this.latestChange + 1_500, (this.firstChange ?? this.latestChange) + 10_000);
    this.timer = setTimeout(() => void this.flush(), Math.max(0, Math.max(due, this.retryAt) - Date.now()));
  }

  offline() {
    this.cancelTimer();
    if (this.draft && !this.blocked && !this.saving) {
      this.setStatus("offline");
      void this.persist();
    }
  }

  resume() {
    if (!this.draft || this.blocked) return;
    this.failures = 0;
    this.retryAt = 0;
    if (this.io.online()) void this.flush();
    else this.offline();
  }

  retry() {
    if (this.state.status === "conflict") return;
    this.blocked = false;
    this.resume();
  }

  stop() {
    this.stopped = true;
    this.cancelTimer();
  }

  private acknowledge(content: DocumentContent, version: number, revision?: string) {
    this.version = version;
    this.confirmed = content;
    this.pendingWrite = undefined;
    if (!this.draft) return;

    if (this.draft.revision === revision || sameContent(content, this.draft.content)) {
      this.remove(this.draft);
      this.draft = undefined;
      this.firstChange = undefined;
      this.setStatus("saved");
    } else {
      this.setStatus("unsaved");
      void this.persist();
    }
  }

  private reconcile(remote: PageContent, loading = false) {
    if (!this.draft) return;
    const attempted = this.pendingWrite;
    if (sameContent(remote.content, this.draft.content)
        || (attempted && remote.version === attempted.version + 1
          && sameContent(remote.content, attempted.content))) {
      this.acknowledge(remote.content, remote.version);
    } else if (remote.version !== this.version) {
      this.blocked = true;
      this.publish({ status: "conflict", server: remote });
      if (!loading) void this.persist();
    } else {
      this.confirmed = remote.content;
      this.pendingWrite = undefined;
    }
  }

  refreshServer() {
    return this.io.load().then((remote) => {
      if (this.draft && this.state.status === "conflict") this.publish({ server: remote });
      return remote;
    });
  }

  useServer(remote: PageContent) {
    if (!this.draft || this.state.status !== "conflict") return;
    this.blocked = false;
    this.acknowledge(remote.content, remote.version, this.draft.revision);
    this.publish({ server: undefined });
  }

  keepDraft(remote: PageContent) {
    if (!this.draft || this.state.status !== "conflict") return;
    this.confirmed = remote.content;
    this.version = remote.version;
    this.pendingWrite = undefined;
    this.blocked = false;
    this.publish({ server: undefined, status: "unsaved" });
    void this.persist();
    this.resume();
  }

  flush(): Promise<void> | undefined {
    if (this.stopped || this.blocked || this.saving || !this.draft || Date.now() < this.retryAt) return;
    if (!this.io.online()) {
      this.offline();
      return;
    }

    this.cancelTimer();
    this.saving = true;
    const key = documentKey(this.userId, this.pageId);
    const task = (activeSaves.get(key) ?? Promise.resolve()).then(() => this.save());
    activeSaves.set(key, task);
    void task.finally(() => {
      if (activeSaves.get(key) === task) activeSaves.delete(key);
    });
    return task;
  }

  private async save() {
    try {
      if (this.stopped || !this.draft) return;
      this.publish({ status: "saving", failureMessage: undefined });
      if (this.pendingWrite || !this.confirmed) {
        this.reconcile(await this.io.load());
        if (this.blocked || !this.draft || this.stopped) return;
      }

      const { content, revision } = this.draft;
      this.firstChange = undefined;
      this.pendingWrite = { version: this.version, content };
      await this.persist();
      if (this.stopped) return;
      const saved = await this.io.save(content, this.version);
      this.failures = 0;
      this.acknowledge(content, saved.version, revision);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        this.blocked = true;
        this.setStatus("conflict");
        try {
          const remote = await this.io.load();
          this.blocked = false;
          this.reconcile(remote);
          if (!this.blocked) this.failures = 0;
        } catch {
          // Retain the draft until the user can inspect the server version.
        }
      } else if (!this.io.online()) {
        this.setStatus("offline");
      } else {
        this.publish({ status: "error", failureMessage: error instanceof ApiError ? error.message : undefined });
        if (isTemporary(error) && this.failures < 5) {
          this.retryAt = Date.now() + 1_000 * 2 ** this.failures++;
        } else {
          this.blocked = true;
        }
      }
      void this.persist();
    } finally {
      this.saving = false;
      if (!this.io.online()) this.offline();
      this.schedule();
    }
  }
}
