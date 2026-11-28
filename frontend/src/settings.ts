import { createContext, useContext } from "react";

export type ThemePreference = "system" | "light" | "dark";

const storageKey = "folio-theme";

export function guestTheme(): ThemePreference {
  const stored = localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
}

interface ThemeSettings {
  theme: ThemePreference;
  canSave: boolean;
  isSaving: boolean;
  error?: string;
  retry?: () => void;
  save: (theme: ThemePreference) => Promise<void>;
}

export const ThemeContext = createContext<ThemeSettings | null>(null);

export function useThemeSettings() {
  const settings = useContext(ThemeContext);
  if (!settings) throw new Error("ThemeProvider ausente.");
  return settings;
}

applyTheme(guestTheme());
