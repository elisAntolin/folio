import "./Sidebar.css";

import homeIcon from "../../assets/casa.svg";
import pageIcon from "../../assets/pagina.svg";
import verticalDotsIcon from "../../assets/pontos-vertical.svg";

import SearchFilterBar from "../../components/SearchFilterBar/SearchFilterBar";
import AddPageButton from "../AddPageButton/AddPageButton";

import { Link } from "react-router";

const page = {
  id: "1",
  name: "Visão Geral",
  icon: homeIcon,
};

const subpages = [
  {
    id: "2",
    name: "Subpágina 1",
    icon: pageIcon,
  },
  {
    id: "3",
    name: "Subpágina 2",
    icon: pageIcon,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-search">
        <SearchFilterBar />
      </div>

      <hr className="sidebar-divider" />

      <section className="sidebar-pages" aria-labelledby="sidebar-title">
        <div className="sidebar-pages-header">
          <h2 id="sidebar-title">Back-End</h2>

          <AddPageButton></AddPageButton>
        </div>

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
                {subpages.map((subpage) => (
                  <li key={subpage.id} className="sidebar-list-item">
                    <Link to={`/pages/${subpage.id}`} className="sidebar-link">
                      <img src={subpage.icon} alt="" />
                      <span className="subpages-name">{subpage.name}</span>
                      <img className="subpages-actions" src={verticalDotsIcon} alt="" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </section>
    </aside>
  );
}

export default Sidebar;
