import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ApiError } from "../../api";
import PageDocument from "../../components/PageDocument/PageDocument";
import PageAccessRequest from "../../components/PageAccessRequest/PageAccessRequest";
import type { DocumentContent } from "../../components/BlockEditor/schema";
import PersistentPageDocument from "../../editor/PersistentPageDocument";
import { getPublicContent, getSharedPage, type SharedPage } from "../../sharingApi";
import { getSession, subscribeSession } from "../../session";

function SharedDocument({ token, signedIn }: { token: string; signedIn: boolean }) {
  const { pathname, search, hash } = useLocation();
  const [page, setPage] = useState<SharedPage>();
  const [snapshot, setSnapshot] = useState<DocumentContent>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function load() {
      try {
        const target = await getSharedPage(token, signal);
        if (target.permission === "VIEWER") {
          const document = await getPublicContent(token, signal);
          if (!signal.aborted) setSnapshot(document);
        }
        if (!signal.aborted) setPage(target);
      } catch (reason) {
        if (!signal.aborted) setError(reason instanceof Error ? reason : new Error("Não foi possível abrir o link."));
      }
    }
    void load();
    return () => controller.abort();
  }, [token]);

  if (error) return <main className="editor-main">
    <p role="alert">{error.message}</p>
    {error instanceof ApiError && error.status === 401 &&
      <Link to="/login" state={{ returnTo: pathname + search + hash }}>Entrar no Folio</Link>}
  </main>;
  if (!page) return <main className="editor-main"><p role="status">Carregando página compartilhada…</p></main>;

  return <main className="editor-main">
    <h1>{page.title}</h1>
    {page.permission === "VIEWER"
      ? <>
        {signedIn && <PageAccessRequest pageId={page.id} permission="EDITOR" />}
        <PageDocument initialContent={snapshot} coverImage={page.coverImageUrl} editable={false} />
      </>
      : <PersistentPageDocument pageId={page.id} shareToken={token} coverImage={page.coverImageUrl} />}
  </main>;
}

export default function SharedEditorPage() {
  const { token = "" } = useParams();
  const session = useSyncExternalStore(subscribeSession, getSession);
  return <SharedDocument key={JSON.stringify([token, session?.id])} token={token} signedIn={Boolean(session)} />;
}
