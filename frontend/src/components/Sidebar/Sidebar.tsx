import { useState } from "react";
import "./Sidebar.css";

import homeIcon from "../../assets/casa.svg";
import pageIcon from "../../assets/pagina.svg";

import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import AddPageButton from "../AddPageButton/AddPageButton";
import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";
import SortFilter, {
  type SortOption,
} from "../modals/SortFilter/SortFilter";

import { Link } from "react-router";

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

function Sidebar() {
  const [subpages, setSubpages] = useState(initialSubpages);
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const sortedSubpages = [...subpages].sort((firstSubpage, secondSubpage) => {
    if (sortBy === "alphabetical") {
      return firstSubpage.name.localeCompare(secondSubpage.name, "pt-BR");
    }

    if (sortBy === "recent") {
      return secondSubpage.createdAt - firstSubpage.createdAt;
    }

    return firstSubpage.createdAt - secondSubpage.createdAt;
  });

  function handleCreateSubpage(title: string, category: string) {
    setSubpages((currentSubpages) => [
      ...currentSubpages,
      {
        id: String(currentSubpages.length + 2),
        name: title,
        icon: pageIcon,
        createdAt: Date.now(),
        category,
      },
    ]);
  }

  function handleEditSubpage(id: string, newTitle: string) {
    setSubpages((currentSubpages) =>
      currentSubpages.map((subpage) =>
        subpage.id === id ? { ...subpage, name: newTitle } : subpage,
      ),
    );
  }

  function handleDeleteSubpage(id: string) {
    setSubpages((currentSubpages) =>
      currentSubpages.filter((subpage) => subpage.id !== id),
    );
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
                  <li key={subpage.id} className="sidebar-list-item">
                    <Link to={`/pages/${subpage.id}`} className="sidebar-link">
                      <img src={subpage.icon} alt="" />
                      <span className="subpages-name">{subpage.name}</span>
                    </Link>
                    <PageActionsMenu
                      currentTitle={subpage.name}
                      publicLink={`/pages/${subpage.id}`}
                      onEdit={(newTitle) =>
                        handleEditSubpage(subpage.id, newTitle)
                      }
                      onShare={(email, permission) =>
                        console.log(
                          "Compartilhar subpágina:",
                          subpage.id,
                          email,
                          permission,
                        )
                      }
                      onDelete={() => handleDeleteSubpage(subpage.id)}
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
          <AddPageButton
            label="Criar nova página"
            onCreate={handleCreateSubpage}
          />
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
