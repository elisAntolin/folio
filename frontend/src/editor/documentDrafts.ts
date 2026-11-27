import type { DocumentContent } from "../components/BlockEditor/schema";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error" | "conflict" | "offline";

export interface PendingWrite {
  version: number;
  content: DocumentContent;
}

export interface DocumentDraft {
  userId: string;
  pageId: string;
  id: string;
  content: DocumentContent;
  version: number;
  revision: string;
  modifiedAt: number;
  status: SaveStatus;
  pendingWrite?: PendingWrite;
}

let database: Promise<IDBDatabase> | undefined;

function openDatabase() {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("folio-editor", 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore("drafts", { keyPath: ["userId", "pageId", "id"] });
      store.createIndex("document", ["userId", "pageId"]);
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        database = undefined;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    database = undefined;
    throw error;
  });
  return database;
}

async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, result: (value: T) => void) => void,
): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", mode);
    let value: T;
    tx.oncomplete = () => resolve(value);
    tx.onabort = () => reject(tx.error ?? new Error("Não foi possível acessar o rascunho."));
    operation(tx.objectStore("drafts"), (result) => { value = result; });
  });
}

export function readDrafts(userId: string, pageId: string) {
  return transaction<DocumentDraft[]>("readonly", (store, result) => {
    const request = store.index("document").getAll(IDBKeyRange.only([userId, pageId]));
    request.onsuccess = () => result(request.result.sort(
      (first: DocumentDraft, second: DocumentDraft) => second.modifiedAt - first.modifiedAt,
    ));
  });
}

export function writeDraft(draft: DocumentDraft) {
  return transaction<void>("readwrite", (store) => { store.put(draft); });
}

export function removeDraft(draft: DocumentDraft) {
  return transaction<void>("readwrite", (store) => {
    const key = [draft.userId, draft.pageId, draft.id];
    const request = store.get(key);
    request.onsuccess = () => {
      if (request.result?.revision === draft.revision) store.delete(key);
    };
  });
}
