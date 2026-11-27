import { ApiError, request, type PageAccess, type PageContent, type PageSummary } from "./api";

export type SharePermission = Exclude<PageAccess, "OWNER">;
export interface PageMember { userId: string; email: string; permission: PageAccess }
export interface ShareLink {
  id: string;
  permission: SharePermission;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}
export type SharedPage = Pick<PageSummary, "id" | "title" | "coverImageUrl"> & {
  permission: SharePermission;
};

const pagePath = (id: string) => `/pages/${encodeURIComponent(id)}`;
const publicPath = (token: string) => `/shared/${encodeURIComponent(token)}`;

export async function listSharing(id: string, signal?: AbortSignal): Promise<[PageMember[], ShareLink[]]> {
  return Promise.all([
    request(`${pagePath(id)}/permissions`, { signal }).then((response) => response.json()),
    request(`${pagePath(id)}/share-links`, { signal }).then((response) => response.json()),
  ]);
}

export async function inviteMember(id: string, email: string, permission: SharePermission) {
  await request(`${pagePath(id)}/permissions`, { method: "POST", body: JSON.stringify({ email, permission }) });
}

export async function changeMember(id: string, userId: string, permission?: SharePermission) {
  await request(`${pagePath(id)}/permissions/${encodeURIComponent(userId)}`, permission
    ? { method: "PATCH", body: JSON.stringify({ permission }) }
    : { method: "DELETE" });
}

export async function generateLink(
  id: string, permission: SharePermission, expiresAt: string | null,
): Promise<{ link: ShareLink; token: string }> {
  const response = await request(`${pagePath(id)}/share-links`, {
    method: "POST", body: JSON.stringify({ permission, expiresAt }),
  });
  return response.json();
}

export async function changeLink(id: string, linkId: string, input?: { permission: SharePermission; expiresAt: string | null }) {
  await request(`${pagePath(id)}/share-links/${encodeURIComponent(linkId)}`, input
    ? { method: "PATCH", body: JSON.stringify(input) }
    : { method: "DELETE" });
}

export async function getSharedPage(token: string, signal: AbortSignal): Promise<SharedPage> {
  try {
    return await (await request(publicPath(token), { signal }, false)).json();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || !sessionStorage.getItem("folio.accessToken")) throw error;
    return (await request(publicPath(token), { signal })).json();
  }
}

export async function getPublicContent(token: string, signal: AbortSignal): Promise<PageContent["content"]> {
  const response = await request(`${publicPath(token)}/content`, { signal }, false);
  const snapshot: PageContent = await response.json();
  return snapshot.content;
}
