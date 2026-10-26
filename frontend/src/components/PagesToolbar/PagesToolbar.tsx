import { useState } from "react";

import "./PagesToolbar.css";

import mais from "../../assets/mais.svg";
import filtro from "../../assets/filtro.svg";
import favorito from "../../assets/favorito.svg";
import grade from "../../assets/grade.svg";
import lista from "../../assets/lista.svg";

function PagesToolbar() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pages-tool-bar">
      <h1>Suas Páginas</h1>

      <div className="pages-toolbar-actions">
        <button className="new-page">
          <img src={mais} alt="Nova Páginas" />
          Nova Página
        </button>

        <span className="header-divider">|</span>

        <button>
          <img src={filtro} alt="Filtro" />
        </button>
        <button>
          <img src={favorito} alt="Favoritos" />
        </button>
        <button onClick={() => setVisible(!visible)}>
          <img src={visible ? grade : lista} alt="Tipo de disposição" />
        </button>
      </div>
    </div>
  );
}

export default PagesToolbar;
