import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import "./FilterCategories.css";

import filtro_categoria from "../../../assets/filtro-categoria.svg";

interface FilterCategoriesProps {
  categories: string[];
  onFilterChange?: (categories: string[]) => void;
}

export default function FilterCategories({
  categories,
  onFilterChange,
}: FilterCategoriesProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Trabalho",
    "Projetos",
  ]);

  function handleCategoryChange(category: string, checked: boolean) {
    const updatedCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter((item) => item !== category);

    setSelectedCategories(updatedCategories);
    onFilterChange?.(updatedCategories);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="filter-trigger"
          aria-label="Filtrar categorias"
        >
          <img src={filtro_categoria} alt="" aria-hidden="true" />
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
            {categories.map((category) => (
              <DropdownMenu.CheckboxItem
                key={category}
                className="filter-item"
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category, checked === true)
                }
                onSelect={(event) => event.preventDefault()}
              >
                <span className="custom-checkbox">
                  {selectedCategories.includes(category) && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="5 12 10 17 20 7" />
                    </svg>
                  )}
                </span>

                <span>{category}</span>
              </DropdownMenu.CheckboxItem>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
