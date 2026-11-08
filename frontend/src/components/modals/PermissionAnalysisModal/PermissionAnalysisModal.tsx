import { useState } from "react";
import { Dialog } from "radix-ui";
import "./PermissionAnalysisModal.css";

import closeIcon from "../../../assets/fechar.svg";
import Avatar from "../../Avatar/Avatar";
import inboxIcon from "../../../assets/caixa-de-entrada.svg";

interface PermissionAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userPhotoUrl?: string;
  action: string;
  message: string;
  onDecision?: (decision: "granted" | "denied") => void;
}

function PermissionInboxIcon() {
  return (
    <img
      src={inboxIcon}
      alt="Inbox"
      className="permission-analysis-inbox-icon"
    />
  );
}

function PermissionAnalysisModal({
  open,
  onOpenChange,
  userName,
  userPhotoUrl,
  action,
  message,
  onDecision,
}: PermissionAnalysisModalProps) {
  const [decision, setDecision] = useState<"granted" | "denied" | null>(null);

  function handleDecision(nextDecision: "granted" | "denied") {
    setDecision(nextDecision);
    onDecision?.(nextDecision);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="permission-analysis-overlay" />
        <Dialog.Content className="permission-analysis-modal">
          <div className="permission-analysis-header">
            <div className="permission-analysis-heading">
              <span className="permission-analysis-icon">
                <PermissionInboxIcon />
              </span>
              <Dialog.Title className="permission-analysis-title">
                Analisar solicitação
              </Dialog.Title>
            </div>
            <Dialog.Close
              className="permission-analysis-close"
              aria-label="Cancelar"
            >
              <img src={closeIcon} alt="" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="permission-analysis-user">
            <Avatar name={userName} photoUrl={userPhotoUrl} />
            <div>
              <strong>{userName}</strong>
              <span>{action}</span>
            </div>
          </div>

          <Dialog.Description className="permission-analysis-message">
            <strong>Mensagem: </strong>
            {message}
          </Dialog.Description>

          {decision ? (
            <p className="permission-analysis-result" role="status">
              {decision === "granted"
                ? "Permissão concedida."
                : "Solicitação negada."}
            </p>
          ) : (
            <div className="permission-analysis-actions">
              <button
                type="button"
                className="permission-analysis-deny"
                onClick={() => handleDecision("denied")}
              >
                Negar
              </button>
              <button
                type="button"
                className="permission-analysis-grant"
                onClick={() => handleDecision("granted")}
              >
                Permitir
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default PermissionAnalysisModal;
