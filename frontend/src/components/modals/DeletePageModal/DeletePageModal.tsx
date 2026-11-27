import { useState } from "react";
import { Dialog } from "radix-ui";
import "./DeletePageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import trashIcon from "../../../assets/lixeira.svg";

interface DeletePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onDelete: () => void | Promise<void>;
}

function DeletePageModal({
  open,
  onOpenChange,
  pageTitle,
  onDelete,
}: DeletePageModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onDelete();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível excluir a página.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(value) => {
      if (submitting) return;
      setError("");
      onOpenChange(value);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="edit-overlay" />

        <Dialog.Content className="edit-modal">
          <div className="edit-header">
            <div className="edit-heading">
              <img src={trashIcon} alt="" aria-hidden="true" />
              <Dialog.Title className="edit-title">
                Excluir Página
              </Dialog.Title>
            </div>

            <Dialog.Close className="edit-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="edit-description">
            Tem certeza que deseja excluir a página
            <strong> "{pageTitle}"</strong>?
            <br />
          </Dialog.Description>

          {error && <p role="alert">{error}</p>}

          <div className="edit-footer">
            <Dialog.Close asChild>
              <button type="button" className="edit-cancel">
                Cancelar
              </button>
            </Dialog.Close>

            <button type="button" className="edit-save" onClick={handleDelete} disabled={submitting}>
              Excluir
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DeletePageModal;
