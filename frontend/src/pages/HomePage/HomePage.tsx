import { useState } from "react";
import Header from "../../components/Header/Header";
import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PagesToolbar from "../../components/PagesToolbar/PagesToolbar";
import PageListCard, {
  type HomePageItem,
} from "../../components/PageListCard/PageListCard";
import PageListItem from "../../components/PageListItem/PageListItem";

function HomePage() {
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Desenvolvimento",
    "Trabalho",
    "Estudos",
    "Pessoal",
    "Projetos",
    "Favoritos",
  ]);
  const [pages, setPages] = useState<HomePageItem[]>(() =>
    Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      title: "🤖 Back-end",
      category: "Estudos",
      categories: ["Estudos"],
      linkPermission: "restricted",
    })),
  );

  function handleCreatePage(title: string, category: string) {
    const newPage = {
      id: String(Date.now()),
      title,
      category,
      categories: [category],
      linkPermission: "restricted",
    };

    setPages((currentPages) => [...currentPages, newPage]);
  }

  function handleEditPage(
    id: string,
    newTitle: string,
    newCategory: string,
  ) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === id
          ? {
              ...page,
              title: newTitle,
              category: newCategory,
              categories: Array.from(
                new Set([...(page.categories ?? [page.category]), newCategory]),
              ),
            }
          : page,
      ),
    );
  }

  function handleDeletePage(id: string) {
    setPages((currentPages) =>
      currentPages.filter((page) => page.id !== id),
    );
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
    selectedCategories.length === 0
      ? pages
      : pages.filter((page) =>
          (page.categories ?? [page.category]).some((category) =>
            selectedCategories.includes(category),
          ),
        );
  const filteredPages = showFavorites
    ? categoryFilteredPages.filter((page) => favoriteIds.includes(page.id))
    : categoryFilteredPages;

  return (
    <div>
      <Header></Header>
      <main>
        <section className="search-section">
          <SearchFilterBar onFilterChange={setSelectedCategories} />
        </section>

        <section className="pages-section">
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
        </section>
      </main>
    </div>
  );
}

export default HomePage;
