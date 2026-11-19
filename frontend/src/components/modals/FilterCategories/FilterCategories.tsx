import { useCallback, useRef, useState } from "react";
import { DropdownMenu } from "radix-ui";
import "./FilterCategories.css";

import categoryFilterIcon from "../../../assets/filtro-categoria.svg";
import searchIcon from "../../../assets/lupa.svg";

interface FilterCategoriesProps {
  categories: string[];
  onFilterChange?: (categories: string[]) => void;
}

function FilterCategories({
  categories,
  onFilterChange,
}: FilterCategoriesProps) {
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(categories);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const selectAllItem = useRef<HTMLDivElement>(null);
  const mountSearchInput = useCallback((input: HTMLInputElement | null) => {
    searchInput.current = input;
    if (input) {
      requestAnimationFrame(() => {
        if (input.isConnected) input.focus({ preventScroll: true });
      });
    }
  }, []);
  const search = query.trim().toLocaleLowerCase("pt-BR");
  const visibleCategories = categories.filter((category) =>
    category.toLocaleLowerCase("pt-BR").includes(search),
  );

  const effectiveSelectedCategories = selectedCategories.filter((category) =>
    categories.includes(category),
  );

  function handleCategoryChange(category: string, checked: boolean) {
    const updatedCategories = checked
      ? effectiveSelectedCategories.includes(category)
        ? selectedCategories
        : [...selectedCategories, category]
      : effectiveSelectedCategories.filter((item) => item !== category);

    updateSelection(updatedCategories);
  }

  function updateSelection(nextCategories: string[]) {
    setSelectedCategories(nextCategories);
    onFilterChange?.(nextCategories);
  }

  function clearCategories() {
    updateSelection([]);
  }

  const allSelected =
    categories.length > 0 &&
    effectiveSelectedCategories.length === categories.length;
  const partiallySelected =
    effectiveSelectedCategories.length > 0 && !allSelected;

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (!open) setQuery("");
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="filter-trigger"
          aria-label="Filtrar categorias"
          data-active={partiallySelected}
        >
          <img src={categoryFilterIcon} alt="" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="filter-content"
          side="bottom"
          align="end"
          sideOffset={10}
        >
          <DropdownMenu.Label className="filter-title">
            Filtrar por categoria
          </DropdownMenu.Label>

          <div className="filter-search">
            <img src={searchIcon} alt="" />
            <input
              type="search"
              ref={mountSearchInput}
              aria-label="Buscar categorias"
              placeholder="Buscar categorias"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
                  event.preventDefault();
                  selectAllItem.current?.focus();
                  event.stopPropagation();
                } else if (event.key !== "Escape" && event.key !== "Tab") {
                  event.stopPropagation();
                }
              }}
            />
          </div>

          <div className="filter-options">
            <DropdownMenu.CheckboxItem
              ref={selectAllItem}
              className="filter-item filter-all-item"
              checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
              onCheckedChange={(checked) =>
                updateSelection(checked === true ? [...categories] : [])
              }
              onSelect={(event) => event.preventDefault()}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
                  event.preventDefault();
                  searchInput.current?.focus();
                }
              }}
            >
              <span
                className={`custom-checkbox${
                  partiallySelected ? " custom-checkbox-partial" : ""
                }`}
              >
                {allSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="5 12 10 17 20 7" />
                  </svg>
                )}
                {partiallySelected && <span aria-hidden="true" />}
              </span>
              <span>Todas</span>
            </DropdownMenu.CheckboxItem>

            <DropdownMenu.Separator className="filter-separator" />

            {visibleCategories.map((category) => {
              const isSelected = effectiveSelectedCategories.includes(category);

              return (
                <DropdownMenu.CheckboxItem
                  key={category}
                  className="filter-item"
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category, checked === true)
                  }
                  onSelect={(event) => event.preventDefault()}
                >
                  <span className="custom-checkbox">
                    {isSelected && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="5 12 10 17 20 7" />
                      </svg>
                    )}
                  </span>

                  <span>{category}</span>
                </DropdownMenu.CheckboxItem>
              );
            })}

            {visibleCategories.length === 0 && (
              <p className="filter-empty" role="status">Nenhuma categoria encontrada.</p>
            )}

            <DropdownMenu.Item
              className="filter-action filter-clear-action"
              onSelect={clearCategories}
            >
              Limpar seleção
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default FilterCategories;
