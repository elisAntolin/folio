import { useState } from "react";
import "./Sidebar.css";

import homeIcon from "../../assets/casa.svg";
import pageIcon from "../../assets/pagina.svg";
import plusIcon from "../../assets/mais.svg";
import filledPinIcon from "../../assets/fixar-diagonal-direita-preenchido.svg";

import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";
import SortFilter, {
  type SortOption,
} from "../modals/SortFilter/SortFilter";

import { Link, useNavigate } from "react-router";

const page = {
  id: "1",
  name: "Visão Geral",
  icon: homeIcon,
};

interface Subpage {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  category?: string;
}

const initialSubpages: Subpage[] = [
  {
    id: "2",
    name: "Subpágina 1",
    icon: pageIcon,
    createdAt: 1,
  },
  {
    id: "3",
    name: "Subpágina 2",
    icon: pageIcon,
    createdAt: 2,
  },
];

const pinnedSubpagesStorageKey = "folio-pinned-subpages";

function getStoredPinnedSubpages(): string[] {
  const stored = localStorage.getItem(pinnedSubpagesStorageKey);

  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) &&
      parsed.every((id): id is string => typeof id === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function Sidebar() {
  const navigate = useNavigate();
  const [subpages, setSubpages] = useState(initialSubpages);
  const [pinnedSubpageIds, setPinnedSubpageIds] = useState(
    getStoredPinnedSubpages,
  );
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const sortedSubpages = [...subpages].sort((firstSubpage, secondSubpage) => {
    const firstIsPinned = pinnedSubpageIds.includes(firstSubpage.id);
    const secondIsPinned = pinnedSubpageIds.includes(secondSubpage.id);

    if (firstIsPinned !== secondIsPinned) {
      return firstIsPinned ? -1 : 1;
    }

    if (sortBy === "alphabetical") {
      return firstSubpage.name.localeCompare(secondSubpage.name, "pt-BR");
    }

    if (sortBy === "recent") {
      return secondSubpage.createdAt - firstSubpage.createdAt;
    }

    return firstSubpage.createdAt - secondSubpage.createdAt;
  });

  function handleCreateSubpage() {
    const newSubpage = {
      id: String(Date.now()),
      name: "Nova subpágina",
      icon: pageIcon,
      createdAt: Date.now(),
    };

    setSubpages((currentSubpages) => [...currentSubpages, newSubpage]);
    navigate(`/pages/${newSubpage.id}`, {
      state: { isNewPage: true },
    });
  }

  function handleEditSubpage(
    id: string,
    newTitle: string,
    newCategory: string,
  ) {
    setSubpages((currentSubpages) =>
      currentSubpages.map((subpage) =>
        subpage.id === id
          ? { ...subpage, name: newTitle, category: newCategory }
          : subpage,
      ),
    );
  }

  function handleDeleteSubpage(id: string) {
    setSubpages((currentSubpages) =>
      currentSubpages.filter((subpage) => subpage.id !== id),
    );
    handlePinnedChange(id, false);
  }

  function handlePinnedChange(id: string, isPinned: boolean) {
    const nextIds = isPinned
      ? [...new Set([...pinnedSubpageIds, id])]
      : pinnedSubpageIds.filter((subpageId) => subpageId !== id);
    setPinnedSubpageIds(nextIds);
    localStorage.setItem(pinnedSubpagesStorageKey, JSON.stringify(nextIds));
  }

  return (
    <aside className="sidebar">
      <section className="sidebar-pages" aria-labelledby="sidebar-title">
        <div className="sidebar-pages-header">
          <h2 id="sidebar-title">Back-End</h2>
          <SortFilter onSortChange={setSortBy} />
        </div>

        <div className="sidebar-search">
          <SearchFilterBar showFilter={false} />
        </div>

        <hr className="sidebar-divider" />

        <nav className="sidebar-navigation" aria-label="Subpáginas">
          <ul className="sidebar-list">
            <li key={page.id}>
              <Link
                to={`/pages/${page.id}`}
                className="sidebar-link sidebar-link-home"
              >
                <img src={page.icon} alt="" />
                <span className="page-name">{page.name}</span>
              </Link>
              <ul>
                {sortedSubpages.map((subpage) => (
                  <li
                    key={subpage.id}
                    className={`sidebar-list-item${
                      pinnedSubpageIds.includes(subpage.id)
                        ? " sidebar-list-item-pinned"
                        : ""
                    }`}
                  >
                    <Link to={`/pages/${subpage.id}`} className="sidebar-link">
                      <img src={subpage.icon} alt="" />
                      <span className="subpages-name">{subpage.name}</span>
                    </Link>
                    {pinnedSubpageIds.includes(subpage.id) && (
                      <img
                        className="sidebar-pinned-icon"
                        src={filledPinIcon}
                        alt="Subpágina fixada"
                      />
                    )}
                    <PageActionsMenu
                      currentTitle={subpage.name}
                      publicLink={`/pages/${subpage.id}`}
                      onEdit={(newTitle, newCategory) =>
                        handleEditSubpage(
                          subpage.id,
                          newTitle,
                          newCategory,
                        )
                      }
                      currentCategory={subpage.category ?? "Desenvolvimento"}
                      onDelete={() => handleDeleteSubpage(subpage.id)}
                      isSubpage
                      isPinned={pinnedSubpageIds.includes(subpage.id)}
                      onPinnedChange={(isPinned) =>
                        handlePinnedChange(subpage.id, isPinned)
                      }
                      onLinkPermissionChange={(permission) =>
                        console.log(
                          "Permissão da subpágina:",
                          subpage.id,
                          permission,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        <div className="sidebar-create-button">
          <button
            type="button"
            className="new-page"
            onClick={handleCreateSubpage}
          >
            <img src={plusIcon} alt="" />
            <span>Criar subpágina</span>
          </button>
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
