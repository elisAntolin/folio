import "./PagesToolbar.css";

import AddPageButton from "../AddPageButton/AddPageButton";
import SortFilter from "../modals/SortFilter/SortFilter";

import Icon from "../Icon/Icon";
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
          className="favorites-filter"
          aria-pressed={showFavorites}
          aria-label={showFavorites ? "Mostrar todas as páginas" : "Mostrar favoritos"}
          onClick={() => onFavoritesChange(!showFavorites)}
        >
          <Icon name="star" filled={showFavorites} />
        </button>
        <button
          type="button"
          className="view-mode-toggle"
          aria-label="Tipo de disposição"
          aria-pressed={mode === "list"}
          onClick={() => changeMode(mode === "grid" ? "list" : "grid")}
        >
          {mode === "grid" ? (
            <img src={listIcon} alt="" />
          ) : (
            <Icon name="grid" filled />
          )}
        </button>
      </div>
    </div>
  );
}

export default PagesToolbar;
