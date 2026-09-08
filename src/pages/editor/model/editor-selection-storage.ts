const storageKey = "wdl.editor.last-selected-database";

export function readLastSelectedDatabaseId(): Schema.Id | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function writeLastSelectedDatabaseId(databaseId: Schema.Id): void {
  try {
    localStorage.setItem(storageKey, databaseId);
  } catch {}
}

export function clearLastSelectedDatabaseId(): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {}
}
