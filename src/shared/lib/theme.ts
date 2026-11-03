export type Theme = "light" | "dark";

const themeStorageKey = "wdl.theme";

export function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Storage may be unavailable (private mode); the theme still applies for this visit.
  }
}
