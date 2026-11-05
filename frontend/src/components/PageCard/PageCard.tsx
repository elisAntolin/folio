import { Link } from "react-router";
import { useState } from "react";

import "./PageCard.css";

import PageActionsMenu from "../modals/PageActionsMenu/PageActionsMenu";

import capa from "../../assets/capa.jpg";
import relogio from "../../assets/relogio.svg";
import estudo from "../../assets/categoria-estudo.svg";

function PageCard() {
  const [pageTitle, setPageTitle] = useState("🤖 Back-end");

  return (
    <div className="page-card">
      <div className="page-card-cover">
        <Link to="/pages/1" className="page-card-cover-link">
          <img src={capa} alt="Capa da página" />
        </Link>
        <span className="page-card-badge page-card-category">
          <img src={estudo} alt="Categoria" />
          Estudos
        </span>

        <span className="page-card-badge page-card-recent">
          <img src={relogio} alt="Recente" />
          Recente
        </span>
      </div>

      <div className="page-card-body">
        <div className="page-card-title-bar">
          <h2>🤖 Back-end</h2>

          <PageActionsMenu
            currentTitle={pageTitle}
            onEdit={(newTitle) => setPageTitle(newTitle)}
            onShare={() => console.log("Compartilhar")}
            onDelete={() => console.log("Excluir")}
          />
        </div>

        <p>57m atrás</p>
      </div>
    </div>
  );
}

export default PageCard;
