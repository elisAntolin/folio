import { Popover } from "radix-ui";
import "./NotificationPageModal.css";
import sino from "../../../assets/sino.svg";

interface Notification {
  id: string;
  code: string;
  message: string;
  date: string;
}

interface NotificationsProps {
  notifications?: Notification[];
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    code: "WA-0023",
    message: 'nova solicitação "Gostaria de colocar esses companheiros"',
    date: "há 6 dias",
  },
  {
    id: "2",
    code: "WA-0020",
    message: 'nova solicitação "Sala de reuniões"',
    date: "há 8 dias",
  },
  {
    id: "3",
    code: "WA-0019",
    message: 'nova solicitação "Cafeteria/local para comer"',
    date: "há 8 dias",
  },
  {
    id: "4",
    code: "WA-0018",
    message: 'nova solicitação "Reserva de equipamentos"',
    date: "há 9 dias",
  },
  {
    id: "5",
    code: "WA-0017",
    message: 'nova solicitação "Acesso ao laboratório"',
    date: "há 10 dias",
  },
];

function Notifications({
  notifications = defaultNotifications,
}: NotificationsProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="notification-trigger"
          aria-label="Abrir notificações"
        >
          <img src={sino} alt="" />

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
                aria-label="Fechar notificações"
              >
                ×
              </button>
            </Popover.Close>

            <h2>Notificações</h2>

            <span className="notification-count">{notifications.length}</span>
          </div>

          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div className="notification-item" key={notification.id}>
                  <div className="notification-icon">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l2-4h14l2 4" />
                      <path d="M3 8h18v11H3z" />
                      <path d="M9 12h6" />
                    </svg>
                  </div>

                  <div className="notification-content">
                    <p>
                      <strong>{notification.code}:</strong>{" "}
                      {notification.message}
                    </p>

                    <span>{notification.date}</span>
                  </div>
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
  );
}

export default Notifications;
