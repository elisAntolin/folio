import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PagesToolbar from "../../components/PagesToolbar/PagesToolbar";
import PageListCard, {
  type HomePageItem,
} from "../../components/PageListCard/PageListCard";
import PageListItem from "../../components/PageListItem/PageListItem";

import { createPage, deletePage, listCategories, listRecentPages, updatePage, type CategoryOption } from "../../api";
import { PageCategoriesContext } from "../../pageCategories";

function HomePage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pages, setPages] = useState<HomePageItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([listRecentPages(controller.signal), listCategories(controller.signal)])
      .then(([recentPages, categoryOptions]) => {
        if (controller.signal.aborted) return;
        setPages(recentPages.map((page) => ({ ...page, linkPermission: "restricted" })));
        setCategories(categoryOptions);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar as páginas.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [loadAttempt]);

  async function handleCreatePage(title: string, category: string) {
    const categoryId = category || null;
    const { id } = await createPage({ title, categoryId });
    setPages((currentPages) => [
      { id, title, categoryId, coverImageUrl: null, linkPermission: "restricted" },
      ...currentPages,
    ]);
  }

  async function handleEditPage(id: string, title: string, category: string) {
    const categoryId = category || null;
    await updatePage(id, { title, categoryId });
    setPages((currentPages) =>
      currentPages.map((page) => page.id === id ? { ...page, title, categoryId } : page),
    );
  }

  async function handleDeletePage(id: string) {
    await deletePage(id);
    setPages((currentPages) => currentPages.filter((page) => page.id !== id));
    setFavoriteIds((currentIds) => currentIds.filter((favoriteId) => favoriteId !== id));
  }

  function handleFavoriteChange(id: string, isFavorite: boolean) {
    setFavoriteIds((currentIds) =>
      isFavorite
        ? [...new Set([...currentIds, id])]
        : currentIds.filter((favoriteId) => favoriteId !== id),
    );
  }

  function handleLinkPermissionChange(id: string, permission: string) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === id ? { ...page, linkPermission: permission } : page,
      ),
    );
  }

  const categoryFilteredPages =
    selectedCategories.length === 0 || selectedCategories.length === categories.length
      ? pages
      : pages.filter((page) => categories.some(
          ({ id, name }) => id === page.categoryId && selectedCategories.includes(name),
        ));
  const filteredPages = showFavorites
    ? categoryFilteredPages.filter((page) => favoriteIds.includes(page.id))
    : categoryFilteredPages;

  return (
    <PageCategoriesContext.Provider value={categories}>
      <div>
        <Header />
        <main>
          <section className="search-section">
            <SearchFilterBar onFilterChange={setSelectedCategories} />
          </section>

          <section className="pages-section">
            {loading && <p role="status">Carregando páginas…</p>}
            {loadError && (
              <div>
                <p role="alert">{loadError}</p>
                <button type="button" onClick={() => {
                  setLoadError(null);
                  setLoading(true);
                  setLoadAttempt((attempt) => attempt + 1);
                }}>Tentar novamente</button>
              </div>
            )}
            {!loading && !loadError && (
              <>
                <PagesToolbar
                  mode={mode}
                  changeMode={setMode}
                  onCreate={handleCreatePage}
                  showFavorites={showFavorites}
                  onFavoritesChange={setShowFavorites}
                />
                {mode === "grid" ? (
                  <PageListCard
                    pages={filteredPages}
                    onEdit={handleEditPage}
                    onDelete={handleDeletePage}
                    onLinkPermissionChange={handleLinkPermissionChange}
                    favoriteIds={favoriteIds}
                    onFavoriteChange={handleFavoriteChange}
                  />
                ) : (
                  <PageListItem
                    pages={filteredPages}
                    onEdit={handleEditPage}
                    onDelete={handleDeletePage}
                    onLinkPermissionChange={handleLinkPermissionChange}
                    favoriteIds={favoriteIds}
                    onFavoriteChange={handleFavoriteChange}
                  />
                )}
                {!filteredPages.length && <p>Nenhuma página encontrada.</p>}
              </>
            )}
          </section>
        </main>
      </div>
    </PageCategoriesContext.Provider>
  );
}

export default HomePage;
