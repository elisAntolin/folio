import { useContext, useState } from "react";
import { PageCategoriesContext } from "../../../pageCategories";
import { Dialog } from "radix-ui";
import "./CreatePageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import pageIcon from "../../../assets/pagina.svg";
import CategorySelect from "../CategorySelect/CategorySelect";

interface CreatePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string, category: string) => void | Promise<void>;
}

function CreatePageModal({
  open,
  onOpenChange,
  onCreate,
}: CreatePageModalProps) {
  const [title, setTitle] = useState("");
  const initialCategory = useContext(PageCategoriesContext) ? "" : "Desenvolvimento";
  const [category, setCategory] = useState(initialCategory);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTitle = title.trim();

    if (!newTitle || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      await onCreate(newTitle, category);
      setTitle("");
      setCategory(initialCategory);
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível salvar a página.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(value: boolean) {
    if (submitting) return;
    onOpenChange(value);

    if (!value) {
      setError("");
      setTitle("");
      setCategory(initialCategory);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="create-overlay" />

        <Dialog.Content className="create-modal">
          <div className="create-header">
            <div className="create-heading">
              <img src={pageIcon} alt="" aria-hidden="true" />
              <Dialog.Title className="create-title">
                Criar Nova Página
              </Dialog.Title>
            </div>

            <Dialog.Close className="create-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="create-description">
            Preencha as informações para criar uma nova página.
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div className="create-field">
              <label htmlFor="page-title" className="create-label">
                Título da Página
              </label>

              <input
                id="page-title"
                className="create-input"
                type="text"
                placeholder="Ex: Planejamento Q3"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={60}
                autoFocus
                required
              />
            </div>

            <div className="create-field">
              <label className="create-label">Categoria da Página</label>

              <CategorySelect
                value={category}
                onChange={setCategory}
                triggerClassName="create-select"
                contentClassName="create-select-content"
                itemClassName="create-select-item"
              />
            </div>

            {error && <p role="alert">{error}</p>}

            <div className="create-footer">
              <Dialog.Close asChild>
                <button type="button" className="create-cancel">
                  Cancelar
                </button>
              </Dialog.Close>

              <button
                type="submit"
                className="create-submit"
                disabled={submitting || !title.trim()}
              >
                Criar Página
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CreatePageModal;
