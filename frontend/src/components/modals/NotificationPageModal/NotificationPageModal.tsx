import { useState } from "react";
import { Popover } from "radix-ui";
import "./NotificationPageModal.css";
import bellIcon from "../../../assets/sino.svg";
import Avatar from "../../Avatar/Avatar";
import PermissionAnalysisModal from "../PermissionAnalysisModal/PermissionAnalysisModal";

interface NotificationItem {
  id: string;
  userName: string;
  userPhotoUrl?: string;
  action: string;
  message: string;
  date: string;
}

interface NotificationPageModalProps {
  notifications?: NotificationItem[];
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "1",
    userName: "Elis Antolin",
    action: "solicitou permissão de edição",
    message: 'nova solicitação "Gostaria de colocar esses companheiros"',
    date: "há 6 dias",
  },
  {
    id: "2",
    userName: "Marina Costa",
    action: "solicitou acesso à página",
    message: 'nova solicitação "Sala de reuniões"',
    date: "há 8 dias",
  },
  {
    id: "3",
    userName: "Rafael Souza",
    action: "compartilhou uma página",
    message: 'nova solicitação "Cafeteria/local para comer"',
    date: "há 8 dias",
  },
  {
    id: "4",
    userName: "Ana Martins",
    action: "solicitou permissão de edição",
    message: 'nova solicitação "Reserva de equipamentos"',
    date: "há 9 dias",
  },
  {
    id: "5",
    userName: "João Lima",
    action: "solicitou acesso à página",
    message: 'nova solicitação "Acesso ao laboratório"',
    date: "há 10 dias",
  },
];

function NotificationPageModal({
  notifications = defaultNotifications,
}: NotificationPageModalProps) {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="notification-trigger"
            aria-label="Abrir notificações"
          >
            <img src={bellIcon} alt="" />

            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="notification-panel"
            align="end"
            sideOffset={8}
            collisionPadding={12}
          >
          <div className="notification-header">
            <Popover.Close asChild>
              <button
                type="button"
                className="notification-close"
                aria-label="Cancelar"
              >
                ×
              </button>
            </Popover.Close>

            <h2>Notificações</h2>

          </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div className="notification-item" key={notification.id}>
                  <Avatar
                    name={notification.userName}
                    photoUrl={notification.userPhotoUrl}
                  />

                  <div className="notification-content">
                    <p>
                      <strong>{notification.userName}</strong>{" "}
                      {notification.action}
                    </p>
                    <p className="notification-message">{notification.message}</p>
                    <span>{notification.date}</span>
                  </div>
                    <button
                      type="button"
                      className="notification-review"
                      aria-label={`Analisar solicitação de ${notification.userName}`}
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 8h18v11H3z" />
                        <path d="m3 8 2-4h14l2 4" />
                        <path d="M8 13h8" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="notification-empty">
                  Nenhuma notificação no momento.
                </div>
              )}
            </div>

            <Popover.Arrow className="notification-arrow" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {selectedNotification && (
        <PermissionAnalysisModal
          open={Boolean(selectedNotification)}
          onOpenChange={(open) => {
            if (!open) setSelectedNotification(null);
          }}
          userName={selectedNotification.userName}
          userPhotoUrl={selectedNotification.userPhotoUrl}
          action={selectedNotification.action}
          message={selectedNotification.message}
        />
      )}
    </>
  );
}

export default NotificationPageModal;
