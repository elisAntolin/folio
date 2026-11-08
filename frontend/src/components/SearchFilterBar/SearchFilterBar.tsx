import { useEffect, useState } from "react";
import searchIcon from "../../assets/lupa.svg";
import FilterCategories from "../modals/FilterCategories/FilterCategories";
import { getCategories, subscribeToCategories } from "../../categories";

import "./SearchFilterBar.css";

interface SearchFilterBarProps {
  showFilter?: boolean;
  onFilterChange?: (categories: string[]) => void;
}

function SearchFilterBar({
  showFilter = true,
  onFilterChange,
}: SearchFilterBarProps) {
  const [categories, setCategories] = useState(getCategories);
  const filterOnlyCategories = ["Projetos", "Favoritos"];
  const availableCategories = [
    ...categories,
    ...filterOnlyCategories.filter((category) => !categories.includes(category)),
  ];

  useEffect(
    () => subscribeToCategories(() => setCategories(getCategories())),
    [],
  );

  return (
    <div className="search-filter-bar">
      <div className="search-bar">
        <img src={searchIcon} alt="" aria-hidden="true" />

        <input
          type="text"
          placeholder="Pesquisar páginas..."
          aria-label="Pesquisar páginas"
        />
      </div>

      {showFilter && (
        <FilterCategories
          categories={availableCategories}
          onFilterChange={onFilterChange}
        />
      )}
    </div>
  );
}

export default SearchFilterBar;
