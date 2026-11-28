import type { DocumentContent } from "./components/BlockEditor/schema";
import { getSession, renewSession } from "./session";

let editorAccount: { sessionId: string; userId: string } | undefined;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request(path: string, options: RequestInit = {}, authenticate = true) {
  const session = authenticate ? getSession() : undefined;
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (session) headers.set("Authorization", `Bearer ${session.accessToken}`);

  const fetchOptions: RequestInit = { ...options, headers, credentials: "omit" };
  let response = await fetch(`/api${path}`, fetchOptions);
  if (response.status === 401 && session && !options.signal?.aborted) {
    const token = await renewSession(session);
    if (token && getSession()?.id === session.id) {
      options.signal?.throwIfAborted();
      headers.set("Authorization", `Bearer ${token}`);
      response = await fetch(`/api${path}`, fetchOptions);
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = typeof payload?.message === "string" ? payload.message : {
      401: "Entre na sua conta para continuar.",
      403: "Você não tem permissão para esta operação.",
      404: "Página não encontrada.",
      410: "Este link expirou ou foi revogado.",
      429: "Limite de solicitações atingido. Tente novamente em instantes.",
    }[response.status] ?? `Falha na requisição (${response.status}).`;
    throw new ApiError(response.status, message);
  }
  return response;
}

export type PageAccess = "OWNER" | "EDITOR" | "VIEWER";

export interface PageSummary {
  id: string;
  title: string;
  categoryId: string | null;
  coverImageUrl: string | null;
  permission: PageAccess;
  favorite: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface PageInput {
  title: string;
  categoryId: string | null;
  parentId?: string;
}

export async function listRecentPages(signal: AbortSignal): Promise<PageSummary[]> {
  const response = await request("/pages/recent", { signal });
  return response.json();
}

export async function searchPages(query: string, signal: AbortSignal, filters: PageFilters = {}): Promise<PageSummary[]> {
  const params = filterParams(filters);
  params.set("q", query);
  const response = await request(`/pages/search?${params}`, { signal });
  return response.json();
}

export async function listCategories(signal: AbortSignal): Promise<CategoryOption[]> {
  const response = await request("/categories", { signal });
  return response.json();
}

export async function createPage(input: PageInput): Promise<{ id: string }> {
  const response = await request("/pages", { method: "POST", body: JSON.stringify(input) });
  return response.json();
}

export async function updatePage(id: string, input: PageInput) {
  await request(`/pages/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deletePage(id: string) {
  await request(`/pages/${id}`, { method: "DELETE" });
}

export interface ContentRevision {
  version: number;
  updatedAt: string;
}

export interface PageContent extends ContentRevision {
  content: DocumentContent;
  canEdit: boolean;
}

export function getEditorSessionKey(): string | undefined {
  return getSession()?.id;
}

export async function getPageContent(pageId: string, signal?: AbortSignal, shareToken?: string): Promise<PageContent> {
  return (await loadPageContent(pageId, signal, shareToken)).content;
}

export async function resolveEditorUser(pageId: string, sessionKey: string, signal: AbortSignal, shareToken?: string) {
  if (editorAccount?.sessionId === sessionKey) return editorAccount.userId;

  const { userId } = await loadPageContent(pageId, signal, shareToken);
  if (!userId || signal.aborted || getEditorSessionKey() !== sessionKey) {
    throw new Error("Não foi possível identificar a conta do editor.");
  }
  editorAccount = { sessionId: sessionKey, userId };
  return userId;
}

async function loadPageContent(pageId: string, signal?: AbortSignal, shareToken?: string) {
  const timeout = AbortSignal.timeout(15_000);
  const response = await request(contentPath(pageId, shareToken), {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  const snapshot: Omit<PageContent, "canEdit"> = await response.json();
  return {
    userId: response.headers.get("X-Folio-User-Id"),
    content: { ...snapshot, canEdit: response.headers.get("X-Folio-Can-Edit") === "true" },
  };
}

export async function savePageContent(
  pageId: string, content: DocumentContent, version: number, shareToken?: string,
): Promise<ContentRevision> {
  const response = await request(contentPath(pageId, shareToken), {
    method: "PUT",
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({ content, version }),
  });
  return response.json();
}

function contentPath(pageId: string, shareToken?: string) {
  return shareToken ? `/shared/${encodeURIComponent(shareToken)}/content` : `/pages/${encodeURIComponent(pageId)}/content`;
}

export interface PageFilters {
  categoryId?: string;
  uncategorized?: boolean;
  favoritesOnly?: boolean;
  page?: number;
}

function filterParams(filters: PageFilters) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.uncategorized) params.set("uncategorized", "true");
  if (filters.favoritesOnly) params.set("favoritesOnly", "true");
  if (filters.page !== undefined) params.set("page", String(filters.page));
  return params;
}

export async function listPages(
  scope: "owned" | "shared" | "favorites", filters: PageFilters, signal: AbortSignal,
): Promise<PageSummary[]> {
  const path = { owned: "/pages", shared: "/pages/shared-with-me", favorites: "/pages/favorites" }[scope];
  return (await request(`${path}?${filterParams(filters)}`, { signal })).json();
}

export async function getPage(id: string, signal: AbortSignal): Promise<PageSummary> {
  return (await request(`/pages/${encodeURIComponent(id)}`, { signal })).json();
}

export async function changeFavorite(id: string, favorite: boolean) {
  await request(`/pages/${encodeURIComponent(id)}/favorite`, { method: favorite ? "PUT" : "DELETE" });
}

export async function renamePage(id: string, title: string) {
  await request(`/pages/${encodeURIComponent(id)}/title`, { method: "PATCH", body: JSON.stringify({ title }) });
}

export async function changePageCover(id: string, coverImageUrl: string | null) {
  await request(`/pages/${encodeURIComponent(id)}/cover`, { method: "PATCH", body: JSON.stringify({ coverImageUrl }) });
}
