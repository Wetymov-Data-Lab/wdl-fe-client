export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const storageKey = "wdl.identity.tokens";
export const authClearedEvent = "wdl:auth-cleared";

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
  window.dispatchEvent(new Event(authClearedEvent));
}

export function getAccessToken(): string | null {
  return readTokens()?.accessToken ?? null;
}

function getAccessTokenClaims(): { sid?: unknown; sub?: unknown } | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as { sid?: unknown; sub?: unknown };
  } catch {
    return null;
  }
}

export function getCurrentSessionId(): string | null {
  const claims = getAccessTokenClaims();
  return typeof claims?.sid === "string" ? claims.sid : null;
}

export function getCurrentAccountId(): string {
  const claims = getAccessTokenClaims();
  if (typeof claims?.sub !== "string") throw new Error("В access token отсутствует идентификатор пользователя");
  return claims.sub;
}
