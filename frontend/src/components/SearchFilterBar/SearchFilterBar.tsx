import lupa from "../../assets/lupa.svg";
import FilterCategories from "../modals/FilterCategories/FilterCategories";

import "./SearchFilterBar.css";

function SearchBar() {
  const categories: string[] = [
    "Trabalho",
    "Estudos",
    "Pessoal",
    "Projetos",
    "Favoritos",
  ];

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

      <FilterCategories
        categories={categories}
        onFilterChange={(selectedCategories: string[]) => {
          console.log("Categorias selecionadas:", selectedCategories);
        }}
      />
    </div>
  );
}

export default SearchBar;
