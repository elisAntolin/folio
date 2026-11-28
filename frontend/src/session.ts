interface Session {
  readonly accessToken: string;
  readonly email: string;
  readonly id: string;
}

const listeners = new Set<() => void>();
const sessionEvents = new BroadcastChannel("folio.session-events");
let session: Session | undefined;
let restoration: Promise<void> | undefined;
let renewal: Promise<string | undefined> | undefined;

// Remove credentials written by older versions of the frontend.
sessionStorage.removeItem("folio.session");
sessionStorage.removeItem("folio.accessToken");
sessionStorage.removeItem("folio.editor.account");

sessionEvents.onmessage = ({ data }) => {
  if (data === session?.id) writeSession();
};

export function getSession() {
  return session;
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function writeSession(next?: Session) {
  session = next;
  listeners.forEach((listener) => listener());
}

function authRequest(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("X-Folio-CSRF", "1");
  if (options.body) headers.set("Content-Type", "application/json");
  return fetch(`/api/${path}`, {
    ...options,
    method: "POST",
    headers,
    credentials: "same-origin",
    signal: AbortSignal.timeout(10_000),
  });
}

async function withSessionCookie<T>(action: () => Promise<T>) {
  // Same-origin tabs share the cookie. Wait for Set-Cookie before the next tab uses it.
  return navigator.locks.request("folio.session-cookie", action);
}

async function readSession(response: Response): Promise<Session> {
  const next: Session = await response.json();
  if (!next.accessToken || !next.email || !next.id) throw new Error("Resposta de autenticação inválida.");
  return next;
}

export function signIn(signup: boolean, credentials: { email: string; password: string; confirmPassword?: string }) {
  return withSessionCookie(async () => {
    const response = await authRequest(signup ? "users/register" : "users/login", {
      body: JSON.stringify(credentials),
    });
    if (response.ok) writeSession(await readSession(response));
    return response.status;
  });
}

async function refresh(sessionId?: string) {
  const response = await authRequest("tokens/refresh", {
    headers: sessionId ? { "X-Folio-Session": sessionId } : undefined,
  });
  if (response.status === 401 || response.status === 409) return;
  if (!response.ok) throw new Error("Não foi possível renovar a sessão. Tente novamente.");
  return readSession(response);
}

export function restoreSession() {
  restoration ??= withSessionCookie(async () => {
    if (!session) writeSession(await refresh());
  });
  return restoration;
}

export function renewSession(previous: Session): Promise<string | undefined> {
  if (session?.id !== previous.id) return Promise.resolve(undefined);
  if (session !== previous) return Promise.resolve(session.accessToken);

  renewal ??= withSessionCookie(async () => {
    if (session?.id !== previous.id) return;
    if (session !== previous) return session.accessToken;
    const next = await refresh(previous.id);
    if (session?.id !== previous.id) return;
    if (!next || next.id !== previous.id) {
      writeSession();
      if (!next) sessionEvents.postMessage(previous.id);
      return;
    }
    writeSession(next);
    return next.accessToken;
  }).finally(() => { renewal = undefined; });
  return renewal;
}

export async function endSession() {
  const previous = session;
  if (!previous) return;

  await withSessionCookie(async () => {
    const response = await authRequest("tokens/logout", { headers: { "X-Folio-Session": previous.id } });
    if (!response.ok && response.status !== 409) {
      throw new Error("Não foi possível encerrar a sessão. Tente novamente.");
    }
    if (session?.id === previous.id) writeSession();
    sessionEvents.postMessage(previous.id);
  });
}
