import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { request } from "./api";
import { getSession, subscribeSession } from "./session";
import { applyTheme, guestTheme, ThemeContext, type ThemePreference } from "./settings";

const themePath = "/me/preferences/theme";
const sessionId = () => getSession()?.id;

type ThemeResult =
  | { account: string; theme: ThemePreference }
  | { account: string; error: string };

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const account = useSyncExternalStore(subscribeSession, sessionId);
  const [result, setResult] = useState<ThemeResult>();
  const [attempt, setAttempt] = useState(0);
  const [savingAccount, setSavingAccount] = useState<string>();
  const [saveError, setSaveError] = useState<{ account: string; message: string }>();

  const current = result?.account === account ? result : undefined;
  const savedTheme = current && "theme" in current ? current.theme : undefined;
  const loadError = current && "error" in current ? current.error : undefined;
  const theme = account ? savedTheme ?? "system" : guestTheme();
  const isSaving = Boolean(account && savingAccount === account);

  useEffect(() => { applyTheme(theme); }, [theme]);

  useEffect(() => {
    if (!account) return;
    const controller = new AbortController();
    const { signal } = controller;
    async function load(account: string) {
      try {
        const response = await request(themePath, { signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]) });
        const saved: { theme: ThemePreference } = await response.json();
        if (!signal.aborted) setResult({ account, theme: saved.theme });
      } catch {
        if (!signal.aborted) setResult({ account, error: "Não foi possível carregar o tema da conta." });
      }
    }
    void load(account);
    return () => controller.abort();
  }, [account, attempt]);

  async function save(theme: ThemePreference) {
    if (!account || !savedTheme || isSaving || savedTheme === theme) return;
    setSavingAccount(account);
    setSaveError(undefined);
    try {
      await request(themePath, { method: "PUT", body: JSON.stringify({ theme }), signal: AbortSignal.timeout(10_000) });
      if (sessionId() === account) setResult({ account, theme });
    } catch {
      if (sessionId() === account) setSaveError({ account, message: "Não foi possível salvar o tema. Tente novamente." });
    } finally {
      setSavingAccount((current) => current === account ? undefined : current);
    }
  }

  function retry() {
    setResult(undefined);
    setAttempt((current) => current + 1);
  }

  return <ThemeContext.Provider value={{
    theme,
    canSave: Boolean(savedTheme) && !isSaving,
    isSaving,
    error: loadError ?? (saveError?.account === account ? saveError?.message : undefined),
    retry: loadError ? retry : undefined,
    save,
  }}>{children}</ThemeContext.Provider>;
}
