async function request(path: string, options: RequestInit) {
  const token = sessionStorage.getItem("folio.accessToken");
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api${path}`, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    throw new Error("A API exige uma sessão válida para acessar as páginas.");
  }
  if (!response.ok) throw new Error(`Falha na requisição (${response.status}).`);
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
