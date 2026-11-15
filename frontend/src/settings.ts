export type ThemePreference = "system" | "light" | "dark";

const storageKey = "folio-theme";

export function getThemePreference(): ThemePreference {
  const stored = localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function applyTheme(theme: ThemePreference) {
  document.documentElement.dataset.theme = theme;
}

export function saveThemePreference(theme: ThemePreference) {
  localStorage.setItem(storageKey, theme);
  applyTheme(theme);
}

applyTheme(getThemePreference());
