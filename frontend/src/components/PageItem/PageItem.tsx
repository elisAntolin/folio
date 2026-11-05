import { Link } from "react-router";
import { useState } from "react";

import "./PageItem.css";

import capa from "../../assets/capa.jpg";
import relogio from "../../assets/relogio.svg";
import estudo from "../../assets/categoria-estudo.svg";

import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";

function PageList() {
  const [pageTitle, setPageTitle] = useState("🤖 Back-end");

  return (
    <div className="page-item">
      <div className="page-item-cover">
        <Link to="/pages/1" className="page-item-cover-link">
          <img src={capa} alt="Capa da página" />
        </Link>
      </div>

      <div className="page-item-body">
        <div className="page-item-title-bar">
          <h2>{pageTitle}</h2>

          <span className="page-item-badge page-item-category">
            <img src={estudo} alt="" />
            Estudos
          </span>

          <span className="page-item-badge page-item-recent">
            <img src={relogio} alt="" />
            Recente
          </span>

          <PageActionsMenu
            currentTitle={pageTitle}
            onEdit={(newTitle) => setPageTitle(newTitle)}
            onShare={() => console.log("Compartilhar")}
            onDelete={() => console.log("Excluir")}
          />
        </div>

        <div className="page-item-details">
          <p>57m atrás</p>
        </div>
      </div>
    </div>
  );
}

export default PageList;
