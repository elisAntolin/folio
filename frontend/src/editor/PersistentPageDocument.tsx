import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getEditorSessionKey, resolveEditorUser } from "../api";
import BlockEditor from "../components/BlockEditor/BlockEditor";
import PageDocument from "../components/PageDocument/PageDocument";
import type { SaveStatus } from "./documentDrafts";
import { useDocumentAutosave } from "./useDocumentAutosave";

const messages: Record<SaveStatus, string> = {
  saved: "Todas as alterações foram salvas",
  unsaved: "Alterações pendentes",
  saving: "Salvando…",
  error: "Erro ao salvar",
  conflict: "Conflito de edição",
  offline: "Sem conexão — alterações locais",
};

interface DocumentSessionProps {
  userId: string;
  pageId: string;
  draftId?: string;
  sessionKey: string;
  onSelectDraft: (id: string) => void;
}

function DocumentSession({ userId, pageId, sessionKey, draftId, onSelectDraft }: DocumentSessionProps) {
  const autosave = useDocumentAutosave(userId, pageId, sessionKey, draftId);
  const [showRemote, setShowRemote] = useState(false);
  const [reviewError, setReviewError] = useState(false);

  if (autosave.error) {
    return (
      <div className="editor-sync-status">
        <p role="alert">{autosave.error}</p>
        <button type="button" onClick={autosave.retry}>Tentar novamente</button>
      </div>
    );
  }
  if (!autosave.initialContent) return <p role="status">Carregando documento…</p>;

  const remote = autosave.server;

  async function inspectRemote() {
    setReviewError(false);
    try {
      if (await autosave.refreshServer()) setShowRemote(true);
    } catch {
      setReviewError(true);
    }
  }

  return (
    <>
      <div className="editor-sync-status">
        <span role="status">{autosave.readOnly ? "Somente leitura" : messages[autosave.status]}</span>
        {autosave.status === "error" && (
          <button type="button" onClick={autosave.retry}>Tentar novamente</button>
        )}
        {autosave.draftError && (
          <p role="alert">O navegador não conseguiu gravar o rascunho local.</p>
        )}
        {autosave.status === "conflict" && (
          <div>
            <p>Seu rascunho foi mantido. Compare com a versão atual antes de decidir.</p>
            <button type="button" onClick={inspectRemote}>Ver versão do servidor</button>
            {reviewError && <p role="alert">Não foi possível consultar a versão atual.</p>}
            {showRemote && remote && (
              <div>
                <h2>Versão do servidor</h2>
                <BlockEditor key={remote.version} initialContent={remote.content} editable={false} />
                <button type="button" onClick={() => {
                  autosave.keepDraft(remote);
                  setShowRemote(false);
                }}>Salvar meu rascunho sobre esta versão</button>
                <button type="button" onClick={() => {
                  if (!window.confirm("Descartar seu rascunho e usar a versão do servidor?")) return;
                  autosave.useServer(remote);
                  setShowRemote(false);
                }}>Descartar rascunho e usar versão do servidor</button>
              </div>
            )}
          </div>
        )}
        {autosave.otherDrafts.map((draft) => (
          <details key={draft.id}>
            <summary>Outro rascunho local de {new Date(draft.modifiedAt).toLocaleString("pt-BR")}</summary>
            <BlockEditor initialContent={draft.content} editable={false} />
            <button type="button" onClick={() => onSelectDraft(draft.id)}>
              Abrir este rascunho no editor
            </button>
          </details>
        ))}
      </div>
      <PageDocument
        editorKey={autosave.editorKey}
        editable={!autosave.readOnly}
        initialContent={autosave.initialContent}
        onChange={autosave.change}
        onBlur={autosave.flush}
      />
    </>
  );
}

function DocumentWorkspace({ userId, pageId, sessionKey }: { userId: string; pageId: string; sessionKey: string }) {
  const [draftId, setDraftId] = useState<string>();
  return (
    <DocumentSession
      key={draftId ?? "latest"}
      userId={userId}
      pageId={pageId}
      sessionKey={sessionKey}
      draftId={draftId}
      onSelectDraft={setDraftId}
    />
  );
}

function AuthorizedDocument({ pageId, sessionKey }: { pageId: string; sessionKey: string }) {
  const [userId, setUserId] = useState<string>();
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    resolveEditorUser(pageId, sessionKey, controller.signal)
      .then((id) => { if (!controller.signal.aborted) setUserId(id); })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Não foi possível abrir o documento.");
      });
    return () => controller.abort();
  }, [pageId, sessionKey, attempt]);

  if (userId) return <DocumentWorkspace userId={userId} pageId={pageId} sessionKey={sessionKey} />;
  if (error) return (
    <div className="editor-sync-status">
      <p role="alert">{error}</p>
      <button type="button" onClick={() => {
        setError(undefined);
        setAttempt((current) => current + 1);
      }}>Tentar novamente</button>
    </div>
  );
  return <p role="status">Carregando documento…</p>;
}

export default function PersistentPageDocument({ pageId }: { pageId: string }) {
  const sessionKey = getEditorSessionKey();
  if (!sessionKey) {
    return <p role="alert"><Link to="/login">Entre na sua conta</Link> para abrir o documento.</p>;
  }
  return <AuthorizedDocument key={JSON.stringify([sessionKey, pageId])} pageId={pageId} sessionKey={sessionKey} />;
}
