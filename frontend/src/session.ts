export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

interface Session extends SessionTokens {
  id: string;
  email: string;
}

const storageKey = "folio.session";
const listeners = new Set<() => void>();
let session = readSession();
let renewal: { sessionId: string; result: Promise<SessionTokens | undefined> } | undefined;

function readSession(): Session | undefined {
  const stored = sessionStorage.getItem(storageKey);
  if (!stored) return;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    sessionStorage.removeItem(storageKey);
  }
}

export function getSession() {
  return session;
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function writeSession(next?: Session) {
  if (next) {
    sessionStorage.setItem(storageKey, JSON.stringify(next));
  } else {
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem("folio.editor.account");
  }
  session = next;
  listeners.forEach((listener) => listener());
}

export function startSession(email: string, tokens: SessionTokens) {
  writeSession({ ...tokens, email, id: crypto.randomUUID() });
}

function tokenRequest(action: "refresh" | "logout", refreshToken: string) {
  return fetch(`/api/tokens/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    signal: AbortSignal.timeout(10_000),
  });
}

export async function renewSession(previous: Session): Promise<string | undefined> {
  if (session?.id !== previous.id) return;
  if (session.refreshToken !== previous.refreshToken) return session.accessToken;

  if (renewal?.sessionId !== previous.id) {
    const result = (async () => {
      const response = await tokenRequest("refresh", previous.refreshToken);
      if (response.status === 401) {
        if (session?.id === previous.id) writeSession();
        return;
      }
      if (!response.ok) throw new Error("Não foi possível renovar a sessão. Tente novamente.");
      const tokens: SessionTokens = await response.json();
      if (session?.id === previous.id) writeSession({ ...previous, ...tokens });
      return tokens;
    })();
    renewal = { sessionId: previous.id, result };
  }

  const activeRenewal = renewal;
  try {
    await activeRenewal.result;
    return session?.id === previous.id ? session.accessToken : undefined;
  } finally {
    if (renewal === activeRenewal) renewal = undefined;
  }
}

export async function endSession() {
  const previous = session;
  if (!previous) return;
  const pending = renewal?.sessionId === previous.id ? renewal.result : undefined;
  writeSession();

  const rotated = await pending?.catch(() => undefined);
  const response = await tokenRequest("logout", rotated?.refreshToken ?? previous.refreshToken);
  if (!response.ok) throw new Error("Não foi possível encerrar a sessão no servidor.");
}
