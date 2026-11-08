import { useState } from "react";
import { Dialog } from "radix-ui";
import "./EditPageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import editIcon from "../../../assets/editar-quadrado.svg";
import CategorySelect from "../CategorySelect/CategorySelect";

interface EditPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  currentCategory: string;
  onSave: (newTitle: string, newCategory: string) => void;
}

function EditPageModal({
  open,
  onOpenChange,
  currentTitle,
  currentCategory,
  onSave,
}: EditPageModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [category, setCategory] = useState(currentCategory);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTitle = title.trim();

    if (!newTitle) return;

    onSave(newTitle, category);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="edit-overlay" />

        <Dialog.Content className="edit-modal">
          <div className="edit-header">
            <div className="edit-heading">
              <img src={editIcon} alt="" aria-hidden="true" />
              <Dialog.Title className="edit-title">
                Editar Página
              </Dialog.Title>
            </div>

            <Dialog.Close className="edit-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="edit-description">
            Altere as informações da página.
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <label htmlFor="page-title" className="edit-label">
              Novo título
            </label>

            <input
              id="page-title"
              className="edit-input"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              maxLength={60}
            />

            <label className="edit-label">Nova Categoria</label>

            <CategorySelect
              value={category}
              onChange={setCategory}
              triggerClassName="edit-select"
              contentClassName="edit-select-content"
              itemClassName="edit-select-item"
            />

            <div className="edit-footer">
              <Dialog.Close asChild>
                <button type="button" className="edit-cancel">
                  Cancelar
                </button>
              </Dialog.Close>

              <button type="submit" className="edit-save">
                Salvar
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default EditPageModal;
