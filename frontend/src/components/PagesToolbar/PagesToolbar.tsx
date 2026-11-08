import "./PagesToolbar.css";

import AddPageButton from "../AddPageButton/AddPageButton";
import SortFilter from "../modals/SortFilter/SortFilter";

import favoriteIcon from "../../assets/favorito.svg";
import gridIcon from "../../assets/grade.svg";
import listIcon from "../../assets/lista.svg";

interface PagesToolbarProps {
  mode: "grid" | "list";
  changeMode: (mode: "grid" | "list") => void;
  onCreate: (title: string, category: string) => void;
  showFavorites: boolean;
  onFavoritesChange: (showFavorites: boolean) => void;
}

function PagesToolbar({
  mode,
  changeMode,
  onCreate,
  showFavorites,
  onFavoritesChange,
}: PagesToolbarProps) {
  return (
    <div className="pages-tool-bar">
      <h1>Suas Páginas</h1>

      <div className="pages-toolbar-actions">
        <AddPageButton onCreate={onCreate} />

        <span className="header-divider">|</span>

        <SortFilter></SortFilter>
        <button
          type="button"
          aria-pressed={showFavorites}
          aria-label={showFavorites ? "Mostrar todas as páginas" : "Mostrar favoritos"}
          onClick={() => onFavoritesChange(!showFavorites)}
        >
          <img src={favoriteIcon} alt="Favoritos" />
        </button>
        <button onClick={() => changeMode(mode === "grid" ? "list" : "grid")}>
          <img
            src={mode === "grid" ? listIcon : gridIcon}
            alt="Tipo de disposição"
          />
        </button>
      </div>
    </div>
  );
}

export default PagesToolbar;
