import { useState } from "react";
import { Dialog, Select } from "radix-ui";
import "./CreatePageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import pageIcon from "../../../assets/pagina.svg";

interface CreatePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string, category: string) => void;
}

function CreatePageModal({
  open,
  onOpenChange,
  onCreate,
}: CreatePageModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Desenvolvimento");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newTitle = title.trim();

    if (!newTitle) return;

    onCreate(newTitle, category);

    setTitle("");
    setCategory("Desenvolvimento");
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    onOpenChange(value);

    if (!value) {
      setTitle("");
      setCategory("Desenvolvimento");
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

            <Dialog.Close className="create-close" aria-label="Fechar">
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

              <Select.Root value={category} onValueChange={setCategory}>
                <Select.Trigger
                  className="create-select"
                  aria-label="Categoria da Página"
                >
                  <Select.Value />
                  <Select.Icon>
                    <img src={chevronDownIcon} alt="" aria-hidden="true" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content
                    className="create-select-content"
                    position="popper"
                    sideOffset={5}
                  >
                    <Select.Viewport>
                      <Select.Item
                        className="create-select-item"
                        value="Desenvolvimento"
                      >
                        <Select.ItemText>Desenvolvimento</Select.ItemText>
                      </Select.Item>

                      <Select.Item
                        className="create-select-item"
                        value="Estudos"
                      >
                        <Select.ItemText>Estudos</Select.ItemText>
                      </Select.Item>

                      <Select.Item
                        className="create-select-item"
                        value="Trabalho"
                      >
                        <Select.ItemText>Trabalho</Select.ItemText>
                      </Select.Item>

                      <Select.Item
                        className="create-select-item"
                        value="Pessoal"
                      >
                        <Select.ItemText>Pessoal</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div className="create-footer">
              <Dialog.Close asChild>
                <button type="button" className="create-cancel">
                  Cancelar
                </button>
              </Dialog.Close>

              <button
                type="submit"
                className="create-submit"
                disabled={!title.trim()}
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
