import { useEffect, useState } from "react";
import { Select } from "radix-ui";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import "./CategorySelect.css";

let categories = ["Desenvolvimento", "Estudos", "Trabalho", "Pessoal"];
const listeners = new Set<() => void>();

function notifyCategoryListeners() {
  listeners.forEach((listener) => listener());
}

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
  triggerClassName: string;
  contentClassName: string;
  itemClassName: string;
}

function CategorySelect({
  value,
  onChange,
  triggerClassName,
  contentClassName,
  itemClassName,
}: CategorySelectProps) {
  const [availableCategories, setAvailableCategories] = useState(categories);
  const [newCategory, setNewCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function refreshCategories() {
    setAvailableCategories([...categories]);
  }

  useEffect(() => subscribe(refreshCategories), []);

  function handleValueChange(nextValue: string) {
    setIsCreating(false);
    onChange(nextValue);
  }

  function handleCreateCategory() {
    const normalizedCategory = newCategory.trim();

    if (
      !normalizedCategory ||
      categories.some(
        (category) =>
          category.toLocaleLowerCase() === normalizedCategory.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    categories = [...categories, normalizedCategory];
    setNewCategory("");
    setIsCreating(false);
    onChange(normalizedCategory);
    notifyCategoryListeners();
  }

  return (
    <>
      <Select.Root
        value={value}
        onValueChange={handleValueChange}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setNewCategory("");
          }
        }}
      >
        <Select.Trigger
          className={triggerClassName}
          aria-label="Categoria da Página"
        >
          <Select.Value />
          <Select.Icon>
            <img src={chevronDownIcon} alt="" aria-hidden="true" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className={contentClassName}
            position="popper"
            sideOffset={5}
          >
            <Select.Viewport>
              {availableCategories.map((category) => (
                <Select.Item
                  key={category}
                  className={itemClassName}
                  value={category}
                >
                  <Select.ItemText>{category}</Select.ItemText>
                </Select.Item>
              ))}

              <button
                type="button"
                className={`${itemClassName} category-create-option`}
                onClick={() => setIsCreating(true)}
                onPointerDown={(event) => event.preventDefault()}
              >
                + Criar nova categoria
              </button>

              {isCreating && (
                <div
                  className="category-create-field"
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <input
                    className="category-new-input"
                    type="text"
                    placeholder="Nome da categoria"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleCreateCategory();
                      }
                    }}
                    maxLength={40}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="category-add-button"
                    onClick={handleCreateCategory}
                    onPointerDown={(event) => event.preventDefault()}
                    disabled={!newCategory.trim()}
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

export default CategorySelect;
