import { useState } from "react";
import { Dialog, Select } from "radix-ui";
import "../SharePageModal/SharePageModal.css";

import closeIcon from "../../../assets/fechar.svg";
import chevronDownIcon from "../../../assets/chevron-baixo.svg";
import membersIcon from "../../../assets/membros.svg";

interface InternalMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onInvite: (email: string, permission: string) => void;
}

function InternalMemberModal({
  open,
  onOpenChange,
  pageTitle,
  onInvite,
}: InternalMemberModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("editor");

  function handleInvite() {
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return;
    onInvite(normalizedEmail, permission);
    setEmail("");
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setPermission("editor");
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
                <img src={membersIcon} alt="" aria-hidden="true" />
                <Dialog.Title className="share-title">
                  Gerenciar Membro
                </Dialog.Title>
              </div>
              <Dialog.Description className="share-description">
                Convide pessoas para colaborar em "{pageTitle}".
              </Dialog.Description>
            </div>
            <Dialog.Close className="share-close" aria-label="Cancelar">
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="share-section">
            <label className="share-label" htmlFor="internal-member-email">
              Convidar pessoas por e-mail
            </label>
            <div className="share-invite-row">
              <input
                id="internal-member-email"
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
          </div>

          <div className="share-permission">
            <label className="share-label">Nível de acesso</label>
            <Select.Root value={permission} onValueChange={setPermission}>
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
                    <Select.Item className="share-select-item" value="editor">
                      <Select.ItemText>Editor</Select.ItemText>
                    </Select.Item>
                    <Select.Item className="share-select-item" value="reader">
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

export default InternalMemberModal;
