import { useState } from "react";
import { Dialog, Select } from "radix-ui";
import "./SharePageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import linkIcon from "../../../assets/link.svg";

interface SharePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  publicLink: string;
  onLinkPermissionChange: (permission: string) => void;
}

function SharePageModal({
  open,
  onOpenChange,
  pageTitle,
  publicLink,
  onLinkPermissionChange,
}: SharePageModalProps) {
  const [linkPermission, setLinkPermission] = useState("reader");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
    } catch (error) {
      console.error("Não foi possível copiar o link da página.", error);
      setCopied(false);
    }
  }

  function handlePermissionChange(value: string) {
    setLinkPermission(value);
    onLinkPermissionChange(value);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setLinkPermission("reader");
      setCopied(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="share-overlay" />
        <Dialog.Content className="share-modal">
          <div className="share-header">
            <div className="share-heading">
              <div className="share-title-row">
                <img src={linkIcon} alt="" aria-hidden="true" />
                <Dialog.Title className="share-title">
                  Compartilhar Página
                </Dialog.Title>
              </div>
              <Dialog.Description className="share-description">
                Compartilhe "{pageTitle}" por meio de um link público.
              </Dialog.Description>
            </div>
            <Dialog.Close className="share-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="share-section">
            <label className="share-label" htmlFor="public-page-link">
              Link de acesso público
            </label>
            <div className="share-link-row">
              <input
                id="public-page-link"
                className="share-link"
                value={publicLink}
                readOnly
                aria-label="Link de acesso público"
              />
              <button
                type="button"
                className="share-copy-button"
                onClick={handleCopy}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="share-permission">
            <label className="share-label">Permissão do link</label>
            <Select.Root
              value={linkPermission}
              onValueChange={handlePermissionChange}
            >
              <Select.Trigger className="share-select">
                <Select.Value />
                <Select.Icon>
                  <img src={chevronDownIcon} alt="" aria-hidden="true" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="share-select-content"
                  position="popper"
                  sideOffset={5}
                >
                  <Select.Viewport>
                    <Select.Item className="share-select-item" value="reader">
                      <Select.ItemText>Leitor</Select.ItemText>
                    </Select.Item>
                    <Select.Item className="share-select-item" value="editor">
                      <Select.ItemText>Editor</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <span className="share-helper">
              {linkPermission === "reader"
                ? "Qualquer pessoa com o link poderá visualizar esta página."
                : "Qualquer pessoa com o link poderá editar esta página."}
            </span>
          </div>

          <div className="share-footer">
            <Dialog.Close asChild>
              <button className="share-done-button" type="button">
                Cancelar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SharePageModal;
