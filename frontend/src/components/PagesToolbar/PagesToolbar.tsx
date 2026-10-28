import "./PagesToolbar.css";

import mais from "../../assets/mais.svg";
import filtro from "../../assets/filtro.svg";
import favorito from "../../assets/favorito.svg";
import grid from "../../assets/grade.svg";
import list from "../../assets/lista.svg";

type PagesToolbarProps = {
  mode: "grid" | "list";
  changeMode: (mode: "grid" | "list") => void;
};

function PagesToolbar({ mode, changeMode }: PagesToolbarProps) {
  return (
    <div className="pages-tool-bar">
      <h1>Suas Páginas</h1>

      <div className="pages-toolbar-actions">
        <button className="new-page">
          <img src={mais} alt="Nova Páginas" />
          <span>Nova Página</span>
        </button>

        <span className="header-divider">|</span>

        <button>
          <img src={filtro} alt="Filtro" />
        </button>
        <button>
          <img src={favorito} alt="Favoritos" />
        </button>
        <button onClick={() => changeMode(mode === "grid" ? "list" : "grid")}>
          <img src={mode === "grid" ? list : grid} alt="Tipo de disposição" />
        </button>
      </div>
    </div>
  );
}

export default PagesToolbar;
