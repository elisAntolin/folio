import { Dialog } from "radix-ui";
import "./DeletePageModal.css";
import fechar from "../../../assets/fechar.svg";

interface DeletePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onDelete: () => void;
}

function DeletePageModal({
  open,
  onOpenChange,
  pageTitle,
  onDelete,
}: DeletePageModalProps) {
  function handleDelete() {
    onDelete();
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="edit-overlay" />

        <Dialog.Content className="edit-modal">
          <div className="edit-header">
            <Dialog.Title className="edit-title">Excluir Página</Dialog.Title>

            <Dialog.Close className="edit-close" aria-label="Fechar">
              <img src={fechar} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="edit-description">
            Tem certeza que deseja excluir a página
            <strong> "{pageTitle}"</strong>?
            <br />
          </Dialog.Description>

          <div className="edit-footer">
            <Dialog.Close asChild>
              <button type="button" className="edit-cancel">
                Cancelar
              </button>
            </Dialog.Close>

            <button type="button" className="edit-save" onClick={handleDelete}>
              Excluir
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default DeletePageModal;
