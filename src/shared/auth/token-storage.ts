export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const storageKey = "wdl.identity.tokens";

export function readTokens(): StoredTokens | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as StoredTokens) : null;
  } catch {
    return null;
  }
}

export function writeTokens(tokens: StoredTokens): void {
  localStorage.setItem(storageKey, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(storageKey);
}

export function getAccessToken(): string | null {
  return readTokens()?.accessToken ?? null;
}

export function getCurrentSessionId(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalized)) as { sid?: unknown };
    return typeof claims.sid === "string" ? claims.sid : null;
  } catch {
    return null;
  }
}
