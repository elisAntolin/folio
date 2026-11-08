import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import "./FilterCategories.css";

import categoryFilterIcon from "../../../assets/filtro-categoria.svg";

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="filter-trigger"
          aria-label="Filtrar categorias"
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

          <div className="filter-options">
            <DropdownMenu.CheckboxItem
              className="filter-item filter-all-item"
              checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
              onCheckedChange={(checked) =>
                updateSelection(checked === true ? [...categories] : [])
              }
              onSelect={(event) => event.preventDefault()}
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

            {categories.map((category) => {
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
