import { useState } from "react";
import { Dialog } from "radix-ui";
import "./EditPageModal.css";
import fechar from "../../../assets/fechar.svg";

interface EditPageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onSave: (newTitle: string) => void;
}

function EditPageModal({
  open,
  onOpenChange,
  currentTitle,
  onSave,
}: EditPageModalProps) {
  const [title, setTitle] = useState(currentTitle);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTitle = title.trim();

    if (!newTitle) return;

    onSave(newTitle);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="edit-overlay" />

        <Dialog.Content className="edit-modal">
          <div className="edit-header">
            <Dialog.Title className="edit-title">Editar Página</Dialog.Title>

            <Dialog.Close className="edit-close" aria-label="Fechar">
              <img src={fechar} alt="" aria-hidden="true" />
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

            <label htmlFor="page-title" className="edit-label">
              Nova Categoria
            </label>

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
