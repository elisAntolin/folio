import { useEffect, useState } from "react";
import { Select } from "radix-ui";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import {
  addCategory,
  getCategories,
  subscribeToCategories,
} from "../../../categories";
import "./CategorySelect.css";

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
  const [availableCategories, setAvailableCategories] = useState(getCategories);
  const [newCategory, setNewCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(
    () => subscribeToCategories(() => setAvailableCategories(getCategories())),
    [],
  );

  function handleValueChange(nextValue: string) {
    setIsCreating(false);
    onChange(nextValue);
  }

  function handleCreateCategory() {
    const normalizedCategory = newCategory.trim();

    if (
      !normalizedCategory ||
      getCategories().some(
        (category) =>
          category.toLocaleLowerCase() ===
          normalizedCategory.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    if (!addCategory(normalizedCategory)) return;

    setNewCategory("");
    setIsCreating(false);
    onChange(normalizedCategory);
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

              {isCreating ? (
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
                      } else if (event.key === "Escape") {
                        setIsCreating(false);
                        setNewCategory("");
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
              ) : (
                <button
                  type="button"
                  className={`${itemClassName} category-create-option`}
                  onClick={() => setIsCreating(true)}
                  onPointerDown={(event) => event.preventDefault()}
                >
                  + Criar nova categoria
                </button>
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

export default CategorySelect;
