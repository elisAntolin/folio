import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import "./SortFilter.css";

import filterIcon from "../../../assets/filtro.svg";

function SortFilter() {
  const [sortBy, setSortBy] = useState("alphabetical");

  const options = [
    { value: "alphabetical", label: "A–Z" },
    { value: "recent", label: "Recentes" },
    { value: "creation", label: "Criação" },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="sort-trigger"
          aria-label="Abrir opções de classificação"
        >
          <img src={filterIcon} alt="" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="sort-content"
          side="bottom"
          align="end"
          sideOffset={10}
        >
          <DropdownMenu.Label className="sort-label">
            Classificar por
          </DropdownMenu.Label>

          <DropdownMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
            {options.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                className="sort-item"
              >
                <span className="sort-checkbox">
                  <DropdownMenu.ItemIndicator>
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
                  </DropdownMenu.ItemIndicator>
                </span>

                <span>{option.label}</span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default SortFilter;
