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
  const [pages, setPages] = useState<HomePageItem[]>(() =>
    Array.from({ length: 6 }, (_, index) => ({
      id: String(index + 1),
      title: "🤖 Back-end",
      category: "Estudos",
      sharedEmails: [],
      sharedPermission: "visualizar",
      linkPermission: "restricted",
    })),
  );

  function handleCreatePage(title: string, category: string) {
    const newPage = {
      id: String(Date.now()),
      title,
      category,
      sharedEmails: [],
      sharedPermission: "visualizar",
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
          ? { ...page, title: newTitle, category: newCategory }
          : page,
      ),
    );
  }

  function handleSharePage(
    id: string,
    email: string,
    permission: string,
  ) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === id && !page.sharedEmails.includes(email)
          ? {
              ...page,
              sharedEmails: [...page.sharedEmails, email],
              sharedPermission: permission,
            }
          : page,
      ),
    );
  }

  function handleDeletePage(id: string) {
    setPages((currentPages) =>
      currentPages.filter((page) => page.id !== id),
    );
  }

  function handleLinkPermissionChange(id: string, permission: string) {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === id ? { ...page, linkPermission: permission } : page,
      ),
    );
  }

  return (
    <div>
      <Header></Header>
      <main>
        <section className="search-section">
          <SearchFilterBar />
        </section>

        <section className="pages-section">
          <PagesToolbar
            mode={mode}
            changeMode={setMode}
            onCreate={handleCreatePage}
          />
          {mode === "grid" ? (
            <PageListCard
              pages={pages}
              onEdit={handleEditPage}
              onShare={handleSharePage}
              onDelete={handleDeletePage}
              onLinkPermissionChange={handleLinkPermissionChange}
            />
          ) : (
            <PageListItem
              pages={pages}
              onEdit={handleEditPage}
              onShare={handleSharePage}
              onDelete={handleDeletePage}
              onLinkPermissionChange={handleLinkPermissionChange}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;
