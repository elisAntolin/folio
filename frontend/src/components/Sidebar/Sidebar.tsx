import { useState } from "react";
import "./Sidebar.css";

import homeIcon from "../../assets/casa.svg";
import pageIcon from "../../assets/pagina.svg";
import plusIcon from "../../assets/mais.svg";

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

function Sidebar() {
  const navigate = useNavigate();
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
                      onEdit={(newTitle, newCategory) =>
                        handleEditSubpage(
                          subpage.id,
                          newTitle,
                          newCategory,
                        )
                      }
                      currentCategory={subpage.category ?? "Desenvolvimento"}
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
