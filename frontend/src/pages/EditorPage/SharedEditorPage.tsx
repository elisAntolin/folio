import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError } from "../../api";
import PageDocument from "../../components/PageDocument/PageDocument";
import type { DocumentContent } from "../../components/BlockEditor/schema";
import PersistentPageDocument from "../../editor/PersistentPageDocument";
import { getPublicContent, getSharedPage, type SharedPage } from "../../sharingApi";

function SharedDocument({ token }: { token: string }) {
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
    {error instanceof ApiError && error.status === 401 && <Link to="/login">Entrar no Folio</Link>}
  </main>;
  if (!page) return <main className="editor-main"><p role="status">Carregando página compartilhada…</p></main>;

  return <main className="editor-main">
    <h1>{page.title}</h1>
    {page.permission === "VIEWER"
      ? <PageDocument initialContent={snapshot} coverImage={page.coverImageUrl} editable={false} />
      : <PersistentPageDocument pageId={page.id} shareToken={token} coverImage={page.coverImageUrl} />}
  </main>;
}

export default function SharedEditorPage() {
  const { token = "" } = useParams();
  return <SharedDocument key={token} token={token} />;
}
