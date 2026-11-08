
import { useState } from "react";
import { Dialog, Select } from "radix-ui";
import "./SharePageModal.css";
import closeIcon from "../../../assets/fechar.svg";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import shareIcon from "../../../assets/compartilhar-seta.svg";

interface SharePageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  publicLink: string;
  onInvite: (email: string, permission: string) => void;
  onLinkPermissionChange: (permission: string) => void;
}

function SharePageModal({
  open,
  onOpenChange,
  pageTitle,
  publicLink,
  onInvite,
  onLinkPermissionChange,
}: SharePageModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("editor");
  const [linkPermission, setLinkPermission] = useState("reader");
  const [copied, setCopied] = useState(false);

  function handleInvite() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return;
    }

    onInvite(normalizedEmail, permission);
    setEmail("");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function handlePermissionChange(value: string) {
    setLinkPermission(value);
    onLinkPermissionChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="share-overlay" />

        <Dialog.Content className="share-modal">

          <div className="share-header">
            <div className="share-heading">
              <div className="share-title-row">
                <img src={shareIcon} alt="" aria-hidden="true" />
                <Dialog.Title className="share-title">
                  Compartilhar Página
                </Dialog.Title>
              </div>

              <Dialog.Description className="share-description">
                Defina as permissões de acesso para "{pageTitle}".
              </Dialog.Description>
            </div>

            <Dialog.Close className="share-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="share-section">
            <label htmlFor="share-email" className="share-label">
              Convidar pessoas por e-mail
            </label>

            <div className="share-invite-row">
              <input
                id="share-email"
                type="email"
                className="share-input"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <button
                type="button"
                className="share-invite-button"
                onClick={handleInvite}
                disabled={!email.trim()}
              >
                Convidar
              </button>
            </div>

            <div className="share-permission">
              <label className="share-label">
                Nível de acesso
              </label>

              <Select.Root
                value={permission}
                onValueChange={setPermission}
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
                      <Select.Item
                        className="share-select-item"
                        value="editor"
                      >
                        <Select.ItemText>Editor</Select.ItemText>
                      </Select.Item>

                      <Select.Item
                        className="share-select-item"
                        value="reader"
                      >
                        <Select.ItemText>Leitor</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              <span className="share-helper">
                {permission === "editor"
                  ? "Poderá visualizar e editar esta página."
                  : "Poderá apenas visualizar esta página."}
              </span>
            </div>
          </div>

          <div className="share-divider" />

          <div className="share-section">
            <label className="share-label">
              Link de acesso público
            </label>

            <div className="share-link-row">
              <div className="share-link">
                <span>{publicLink}</span>
              </div>

              <button
                type="button"
                className="share-copy-button"
                onClick={handleCopy}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="share-permission">
              <label className="share-label">
                Permissão do link
              </label>

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
                      <Select.Item
                        className="share-select-item"
                        value="reader"
                      >
                        <Select.ItemText>Leitor</Select.ItemText>
                      </Select.Item>

                      <Select.Item
                        className="share-select-item"
                        value="editor"
                      >
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
          </div>

          <div className="share-footer">
            <Dialog.Close asChild>
              <button className="share-done-button" type="button">
                Concluir
              </button>
            </Dialog.Close>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SharePageModal;
