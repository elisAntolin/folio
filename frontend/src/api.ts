import type { DocumentContent } from "./components/BlockEditor/schema";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request(path: string, options: RequestInit) {
  const token = sessionStorage.getItem("folio.accessToken");
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api${path}`, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    throw new ApiError(response.status, "A API exige uma sessão válida para acessar as páginas.");
  }
  if (!response.ok) throw new ApiError(response.status, `Falha na requisição (${response.status}).`);
  return response;
}

export interface PageSummary {
  id: string;
  title: string;
  categoryId: string | null;
  coverImageUrl: string | null;
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface PageInput {
  title: string;
  categoryId: string | null;
}

export async function listRecentPages(signal: AbortSignal): Promise<PageSummary[]> {
  const response = await request("/pages/recent", { signal });
  return response.json();
}

export async function searchPages(query: string, signal: AbortSignal): Promise<PageSummary[]> {
  const params = new URLSearchParams({ q: query });
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
  return sessionStorage.getItem("folio.accessToken")?.split(".")[2] || undefined;
}

export async function getPageContent(pageId: string, signal?: AbortSignal): Promise<PageContent> {
  return (await loadPageContent(pageId, signal)).content;
}

export async function resolveEditorUser(pageId: string, sessionKey: string, signal: AbortSignal) {
  const bindingKey = "folio.editor.account";
  const cached = sessionStorage.getItem(bindingKey);
  if (cached?.startsWith(`${sessionKey}:`)) return cached.slice(sessionKey.length + 1);

  const { userId } = await loadPageContent(pageId, signal);
  if (!userId || signal.aborted || getEditorSessionKey() !== sessionKey) {
    throw new Error("Não foi possível identificar a conta do editor.");
  }
  sessionStorage.setItem(bindingKey, `${sessionKey}:${userId}`);
  return userId;
}

async function loadPageContent(pageId: string, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(15_000);
  const response = await request(`/pages/${encodeURIComponent(pageId)}/content`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  const snapshot: Omit<PageContent, "canEdit"> = await response.json();
  return {
    userId: response.headers.get("X-Folio-User-Id"),
    content: { ...snapshot, canEdit: response.headers.get("X-Folio-Can-Edit") === "true" },
  };
}

export async function savePageContent(
  pageId: string, content: DocumentContent, version: number,
): Promise<ContentRevision> {
  const response = await request(`/pages/${encodeURIComponent(pageId)}/content`, {
    method: "PUT",
    signal: AbortSignal.timeout(20_000),
    body: JSON.stringify({ content, version }),
  });
  return response.json();
}
