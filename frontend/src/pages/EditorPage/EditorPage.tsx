import "./EditorPage.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { changeFavorite, changePageCover, getEditorSessionKey, getPage, renamePage, type PageSummary } from "../../api";
import Header from "../../components/Header/Header";
import PersistentPageDocument from "../../editor/PersistentPageDocument";
import Sidebar from "../../components/Sidebar/Sidebar";
import PageSharingButton from "../../components/ShareButton/PageSharingButton";
import Icon from "../../components/Icon/Icon";

function EditorWorkspace({ id }: { id: string }) {
  const [page, setPage] = useState<PageSummary>();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void getPage(id, controller.signal).then((loaded) => {
      if (controller.signal.aborted) return;
      setPage(loaded);
      setTitle(loaded.title);
    }, (reason: unknown) => {
      if (!controller.signal.aborted) setLoadError(reason instanceof Error ? reason.message : "Não foi possível abrir a página.");
    });
    return () => controller.abort();
  }, [id]);

  async function saveTitle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || title.trim() === page?.title) return;
    setSavingTitle(true);
    setError("");
    try {
      const nextTitle = title.trim();
      await renamePage(id, nextTitle);
      setPage((current) => current && { ...current, title: nextTitle });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível renomear a página.");
    } finally {
      setSavingTitle(false);
    }
  }

  async function toggleFavorite() {
    if (!page || savingFavorite) return;
    setSavingFavorite(true);
    setError("");
    const favorite = !page.favorite;
    setPage({ ...page, favorite });
    try {
      await changeFavorite(id, favorite);
    } catch (reason) {
      setPage((current) => current && { ...current, favorite: !favorite });
      setError(reason instanceof Error ? reason.message : "Não foi possível atualizar os favoritos.");
    } finally {
      setSavingFavorite(false);
    }
  }

  return <div className="editor-page">
    <Header />
    <div className="editor-body">
      <Sidebar parentId={page?.permission === "OWNER" ? id : undefined} refreshKey={page ? `${page.id}:${page.title}:${page.favorite}` : ""} />
      <div className="editor-content">
        <main className="editor-main">
          {page && <div className="colaboration-bar">
            {page.permission !== "VIEWER" ? <form onSubmit={saveTitle}>
              <input aria-label="Título da página" value={title} maxLength={255}
                onChange={(event) => setTitle(event.target.value)} />
              <button type="submit" disabled={savingTitle || !title.trim() || title.trim() === page.title}>Renomear</button>
            </form> : <h1>{page.title}</h1>}
            <button type="button" aria-label={page.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-pressed={page.favorite} disabled={savingFavorite} onClick={toggleFavorite}>
              <Icon name="star" filled={page.favorite} />
            </button>
            {page.permission === "OWNER" && <PageSharingButton id={id} title={page.title} />}
          </div>}
          {error && <p role="alert">{error}</p>}
          {loadError && <p role="alert">{loadError}</p>}
          <PersistentPageDocument pageId={id} coverImage={page?.coverImageUrl ?? null}
            onCoverChange={page && page.permission !== "VIEWER" ? async (cover) => {
              await changePageCover(id, cover);
              setPage((current) => current && { ...current, coverImageUrl: cover });
            } : undefined} />
        </main>
      </div>
    </div>
  </div>;
}

export default function EditorPage() {
  const { id = "" } = useParams();
  return <EditorWorkspace key={JSON.stringify([getEditorSessionKey(), id])} id={id} />;
}
