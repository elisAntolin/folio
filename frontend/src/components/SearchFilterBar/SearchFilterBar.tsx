import lupa from "../../assets/lupa.svg";
import filtro_categoria from "../../assets/filtro-categoria.svg";

import "./SearchFilterBar.css";

function SearchBar() {
  return (
    <div className="search-filter-bar">
      <div className="search-bar">
        <img src={lupa} alt="" aria-hidden="true" />
        <input
          type="text"
          placeholder="Pesquisar páginas..."
          aria-label="Pesquisar páginas"
        />
      </div>

      <button className="filtro-categoria">
        <img src={filtro_categoria} alt="" aria-hidden="true" />
      </button>
    </div>
  );
}

export default SearchBar;
