import { useEffect, useRef, useState } from "react";
import { ApiError, getPageContent, getEditorSessionKey, savePageContent, type PageContent } from "../api";
import type { DocumentContent } from "../components/BlockEditor/schema";
import { DocumentAutosave, waitForDocumentSave, type AutosaveState } from "./documentAutosave";
import { readDrafts, removeDraft, writeDraft, type DocumentDraft } from "./documentDrafts";

export function useDocumentAutosave(userId: string, pageId: string, sessionKey: string, draftId?: string) {
  const engine = useRef<DocumentAutosave>(null);
  const [initialContent, setInitialContent] = useState<DocumentContent>();
  const [readOnly, setReadOnly] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<AutosaveState>({ status: "saved", draftError: false });
  const [otherDrafts, setOtherDrafts] = useState<DocumentDraft[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    function checkSession() {
      if (getEditorSessionKey() !== sessionKey) {
        throw new ApiError(401, "Entre novamente com a conta que abriu este documento.");
      }
    }

    async function load() {
      checkSession();
      return getPageContent(pageId, signal);
    }

    async function initialize() {
      await waitForDocumentSave(userId, pageId);
      const [server, local] = await Promise.allSettled([load(), readDrafts(userId, pageId)]);
      if (signal.aborted) return;

      const saved = server.status === "fulfilled" ? server.value : undefined;
      const drafts = local.status === "fulfilled" ? local.value : [];
      const draft = drafts.find(({ id }) => id === draftId) ?? drafts[0];
      const accessDenied = server.status === "rejected" && server.reason instanceof ApiError
        && [401, 403, 404].includes(server.reason.status);
      if (!saved && (!draft || accessDenied)) {
        setError(server.status === "rejected" && server.reason instanceof Error
          ? server.reason.message : "Não foi possível carregar o documento.");
        return;
      }

      if (saved && !saved.canEdit) {
        setReadOnly(true);
        setInitialContent(saved.content);
        return;
      }

      const autosave = new DocumentAutosave(userId, pageId, saved, draft, {
        load,
        save: async (content, version) => {
          checkSession();
          return savePageContent(pageId, content, version);
        },
        writeDraft,
        removeDraft,
        online: () => navigator.onLine,
      }, setState);
      engine.current = autosave;
      setOtherDrafts(drafts.filter(({ id }) => id !== draft?.id));
      setInitialContent(draft?.content ?? saved?.content);
      autosave.start();
      if (local.status === "rejected") {
        setState((current) => ({ ...current, draftError: true }));
      }
    }

    const resume = () => engine.current?.resume();
    const offline = () => engine.current?.offline();
    const flush = () => { void engine.current?.flush(); };
    function handleVisibility() {
      if (document.visibilityState === "hidden") flush();
    }

    void initialize();
    window.addEventListener("online", resume);
    window.addEventListener("offline", offline);
    window.addEventListener("blur", flush);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      controller.abort();
      engine.current?.stop();
      engine.current = null;
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", offline);
      window.removeEventListener("blur", flush);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId, pageId, sessionKey, draftId, attempt]);

  return {
    ...state,
    error,
    initialContent,
    readOnly,
    editorKey,
    otherDrafts,
    change: (content: DocumentContent) => engine.current?.change(content),
    flush: () => { void engine.current?.flush(); },
    retry() {
      if (engine.current) {
        engine.current.retry();
      } else {
        setError(undefined);
        setAttempt((current) => current + 1);
      }
    },
    refreshServer: async () => engine.current?.refreshServer(),
    useServer(remote: PageContent) {
      engine.current?.useServer(remote);
      setInitialContent(remote.content);
      setEditorKey((current) => current + 1);
    },
    keepDraft: (remote: PageContent) => engine.current?.keepDraft(remote),
  };
}
