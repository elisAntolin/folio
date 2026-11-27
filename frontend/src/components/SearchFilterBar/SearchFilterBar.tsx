import { useContext, useEffect, useState } from "react";
import searchIcon from "../../assets/lupa.svg";
import FilterCategories from "../modals/FilterCategories/FilterCategories";
import { getCategories, subscribeToCategories } from "../../categories";

import "./SearchFilterBar.css";
import { PageCategoriesContext } from "../../pageCategories";

interface SearchFilterBarProps {
  showFilter?: boolean;
  onSearchChange?: (query: string) => void;
  onFilterChange?: (categories: string[]) => void;
}

function SearchFilterBar({
  showFilter = true,
  onSearchChange,
  onFilterChange,
}: SearchFilterBarProps) {
  const [categories, setCategories] = useState(getCategories);
  const filterOnlyCategories = ["Projetos", "Favoritos"];
  const apiCategories = useContext(PageCategoriesContext);
  const availableCategories = apiCategories?.map(({ name }) => name) ?? [
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
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
      </div>

      {showFilter && (
        <FilterCategories
          key={JSON.stringify(availableCategories)}
          categories={availableCategories}
          onFilterChange={onFilterChange}
        />
      )}
    </div>
  );
}

export default SearchFilterBar;
