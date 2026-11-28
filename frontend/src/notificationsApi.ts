import { request } from "./api";

export type RequestedPermission = "VIEWER" | "EDITOR";
export type NotificationDecision = "GRANTED" | "DENIED";

export interface NotificationItem {
  id: string;
  kind: "PAGE_SHARED" | "ACCESS_REQUESTED" | "ACCESS_GRANTED" | "ACCESS_DENIED";
  actorEmail: string | null;
  pageId: string;
  pageTitle: string | null;
  permission: RequestedPermission;
  message: string | null;
  decision: NotificationDecision | null;
  createdAt: string;
  read: boolean;
}

export interface Inbox {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
}

export async function getNotifications(signal: AbortSignal, before?: string): Promise<Inbox> {
  const query = before ? `?before=${encodeURIComponent(before)}` : "";
  const response = await request(`/notifications${query}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });
  return response.json();
}

export async function markNotificationRead(id: string) {
  await request(`/notifications/${encodeURIComponent(id)}/read`, { method: "PUT", signal: AbortSignal.timeout(10_000) });
}

export async function decideAccessRequest(id: string, decision: NotificationDecision) {
  await request(`/notifications/${encodeURIComponent(id)}/decision`, {
    method: "PUT", body: JSON.stringify({ decision }), signal: AbortSignal.timeout(10_000),
  });
}

export async function requestPageAccess(pageId: string, permission: RequestedPermission, message: string) {
  await request(`/pages/${encodeURIComponent(pageId)}/access-requests`, {
    method: "POST", body: JSON.stringify({ permission, message }), signal: AbortSignal.timeout(10_000),
  });
}
