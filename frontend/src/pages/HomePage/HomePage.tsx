import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PagesToolbar from "../../components/PagesToolbar/PagesToolbar";
import PageListCard, {
  type HomePageItem,
} from "../../components/PageListCard/PageListCard";
import PageListItem from "../../components/PageListItem/PageListItem";

import { createPage, deletePage, listCategories, listRecentPages, searchPages, updatePage, type CategoryOption } from "../../api";
import { PageCategoriesContext } from "../../pageCategories";

type SearchResult = { query: string; attempt: number } & (
  | { pages: HomePageItem[]; error?: never }
  | { pages?: never; error: string }
);

function HomePage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pages, setPages] = useState<HomePageItem[]>([]);
  const [query, setQuery] = useState("");
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
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

  useEffect(() => {
    if (!query || loading || loadError) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const matches = await searchPages(query, controller.signal);
        if (controller.signal.aborted) return;
        setSearchResult({
          query,
          attempt: searchAttempt,
          pages: matches.map((page) => ({ ...page, linkPermission: "restricted" })),
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchResult({
          query,
          attempt: searchAttempt,
          error: error instanceof Error ? error.message : "Não foi possível pesquisar as páginas.",
        });
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, searchAttempt, loading, loadError]);

  function refreshSearch() {
    setSearchAttempt((attempt) => attempt + 1);
  }

  function handleSearchChange(value: string) {
    const nextQuery = value.trim();
    if (nextQuery === query) return;
    setQuery(nextQuery);
    setSearchResult(null);
  }

  async function handleCreatePage(title: string, category: string) {
    const categoryId = category || null;
    const { id } = await createPage({ title, categoryId });
    refreshSearch();
    setPages((currentPages) => [
      { id, title, categoryId, coverImageUrl: null, linkPermission: "restricted" },
      ...currentPages,
    ]);
  }

  async function handleEditPage(id: string, title: string, category: string) {
    const categoryId = category || null;
    await updatePage(id, { title, categoryId });
    refreshSearch();
    setPages((currentPages) =>
      currentPages.map((page) => page.id === id ? { ...page, title, categoryId } : page),
    );
  }

  async function handleDeletePage(id: string) {
    await deletePage(id);
    refreshSearch();
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

  const activeSearch = searchResult?.query === query && searchResult.attempt === searchAttempt
    ? searchResult
    : null;
  const searching = Boolean(query && !activeSearch);
  const displayedPages = query ? activeSearch?.pages ?? [] : pages;
  const categoryFilteredPages =
    selectedCategories.length === 0 || selectedCategories.length === categories.length
      ? displayedPages
      : displayedPages.filter((page) => categories.some(
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
            <SearchFilterBar
              onSearchChange={handleSearchChange}
              onFilterChange={setSelectedCategories}
            />
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
                {searching && <p role="status">Pesquisando páginas…</p>}
                {activeSearch?.error && (
                  <div>
                    <p role="alert">{activeSearch.error}</p>
                    <button type="button" onClick={refreshSearch}>Tentar novamente</button>
                  </div>
                )}
                {!searching && !activeSearch?.error && (mode === "grid" ? (
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
                ))}
                {!searching && !activeSearch?.error && !filteredPages.length && (
                  <p>Nenhuma página encontrada.</p>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </PageCategoriesContext.Provider>
  );
}

export default HomePage;
