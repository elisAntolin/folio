import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Popover } from "radix-ui";
import "./NotificationPageModal.css";
import bellIcon from "../../../assets/sino.svg";
import Avatar from "../../Avatar/Avatar";
import PermissionAnalysisModal from "../PermissionAnalysisModal/PermissionAnalysisModal";
import {
  decideAccessRequest, getNotifications, markNotificationRead,
  type Inbox, type NotificationDecision, type NotificationItem,
} from "../../../notificationsApi";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function action(item: NotificationItem) {
  switch (item.kind) {
    case "PAGE_SHARED": return "compartilhou uma página com você";
    case "ACCESS_REQUESTED": return item.permission === "EDITOR"
      ? "solicitou permissão de edição"
      : "solicitou acesso de leitura";
    case "ACCESS_GRANTED": return "aprovou seu pedido de acesso";
    case "ACCESS_DENIED": return "negou seu pedido de acesso";
  }
}

function NotificationPageModal() {
  const [open, setOpen] = useState(false);
  const [inbox, setInbox] = useState<Inbox>();
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<NotificationItem>();
  const mutation = useRef(0);
  const marking = useRef(new Set<string>());
  const unread = inbox?.unreadCount ?? 0;

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      const version = mutation.current;
      try {
        const next = await getNotifications(controller.signal);
        if (!controller.signal.aborted && version === mutation.current) {
          setInbox(next);
          setLoadError("");
        }
      } catch {
        if (!controller.signal.aborted) setLoadError("Não foi possível carregar as notificações.");
      } finally {
        pending = false;
      }
    }
    void load();
    const timer = open ? undefined : window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [open, attempt]);

  async function loadMore() {
    const cursor = inbox?.nextCursor;
    if (!cursor || isLoadingMore) return;
    const version = mutation.current;
    setIsLoadingMore(true);
    setActionError("");
    try {
      const next = await getNotifications(AbortSignal.timeout(10_000), cursor);
      setInbox((current) => current?.nextCursor === cursor ? {
        items: [...current.items, ...next.items],
        unreadCount: version === mutation.current ? next.unreadCount : current.unreadCount,
        nextCursor: next.nextCursor,
      } : current);
    } catch {
      setActionError("Não foi possível carregar mais notificações.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  function markLocally(id: string, decision?: NotificationDecision) {
    mutation.current += 1;
    setInbox((current) => {
      if (!current) return current;
      const wasUnread = current.items.some((item) => item.id === id && !item.read);
      return {
        ...current,
        unreadCount: wasUnread ? Math.max(0, current.unreadCount - 1) : current.unreadCount,
        items: current.items.map((item) => item.id === id
          ? { ...item, read: true, decision: decision ?? item.decision }
          : item),
      };
    });
  }

  async function markRead(item: NotificationItem) {
    if (item.read || marking.current.has(item.id)) return;
    marking.current.add(item.id);
    setActionError("");
    try {
      await markNotificationRead(item.id);
      markLocally(item.id);
    } catch {
      setActionError("Não foi possível marcar a notificação como lida.");
    } finally {
      marking.current.delete(item.id);
    }
  }

  async function decide(id: string, decision: NotificationDecision) {
    await decideAccessRequest(id, decision);
    markLocally(id, decision);
  }

  return <>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="notification-trigger" aria-label="Abrir notificações"
          aria-description={unread ? `${unread} notificações não lidas` : undefined}>
          <img src={bellIcon} alt="" />
          {unread > 0 && <span className="notification-badge" aria-hidden="true">{unread > 99 ? "99+" : unread}</span>}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="notification-panel" align="end" sideOffset={8} collisionPadding={12}>
          <div className="notification-header">
            <Popover.Close asChild>
              <button type="button" className="notification-close" aria-label="Fechar notificações">×</button>
            </Popover.Close>
            <h2>Notificações</h2>
          </div>
          <div className="notification-list">
            {loadError && <div className="notification-empty" role="alert">{loadError}
              <button type="button" className="notification-review" onClick={() => setAttempt((value) => value + 1)}>
                Tentar novamente
              </button>
            </div>}
            {actionError && <p className="notification-empty" role="alert">{actionError}</p>}
            {!inbox && !loadError && <p className="notification-empty" role="status">Carregando notificações…</p>}
            {inbox?.items.length === 0 && !loadError && <p className="notification-empty">Nenhuma notificação no momento.</p>}
            {inbox?.items.map((item) => {
              const actor = item.actorEmail ?? "O proprietário";
              const isRequest = item.kind === "ACCESS_REQUESTED";
              return <div className={`notification-item${item.read ? "" : " notification-unread"}`} key={item.id}>
                <Avatar name={actor} />
                <div className="notification-content">
                  <p><strong>{actor}</strong> {action(item)}</p>
                  {item.pageTitle && <p className="notification-message">{item.pageTitle}</p>}
                  {item.message && <p className="notification-message">{item.message}</p>}
                  {item.decision && <p className="notification-message">
                    {item.decision === "GRANTED" ? "Permissão concedida" : "Solicitação negada"}
                  </p>}
                  <div className="notification-meta">
                    <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time>
                    <div className="notification-actions">
                      {isRequest && !item.decision && <button type="button" className="notification-review"
                        aria-label={`Analisar solicitação de ${actor}`}
                        onClick={() => { setSelected(item); void markRead(item); }}>Analisar</button>}
                      {!isRequest && item.pageTitle && <Link className="notification-review" to={`/pages/${item.pageId}`}
                        onClick={() => { void markRead(item); setOpen(false); }}>Abrir página</Link>}
                      {!item.read && <button type="button" className="notification-review"
                        onClick={() => void markRead(item)}>Marcar como lida</button>}
                    </div>
                  </div>
                </div>
              </div>;
            })}
            {inbox?.nextCursor && <button type="button" className="notification-more"
              onClick={() => void loadMore()} disabled={isLoadingMore}>
              {isLoadingMore ? "Carregando…" : "Carregar mais"}
            </button>}
          </div>
          <Popover.Arrow className="notification-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
    {selected && <PermissionAnalysisModal
      key={selected.id}
      open
      onOpenChange={(next) => { if (!next) setSelected(undefined); }}
      userName={selected.actorEmail ?? "Solicitante"}
      action={action(selected)}
      message={[selected.pageTitle, selected.message].filter(Boolean).join(" · ")}
      onDecision={(decision) => decide(selected.id, decision)}
    />}
  </>;
}

export default NotificationPageModal;
