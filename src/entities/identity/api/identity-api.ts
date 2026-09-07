import type { IdentityApi as IdentityContract } from "@/shared/api/contracts";
import { clearTokens, readTokens, writeTokens } from "@/shared/auth/token-storage";

const identityServiceUrl = import.meta.env.IDENTITY_SERVICE_URL.replace(/\/$/, "");
const requestTimeoutMs = Number(import.meta.env.CORE_API_TIMEOUT_MS);

export class IdentityApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "IdentityApiError";
  }
}

let refreshRequest: Promise<void> | null = null;

function errorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("detail" in body)) return fallback;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : "Некорректное значение"))
      .join(". ");
  }
  return fallback;
}

async function rawRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${identityServiceUrl}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as unknown;
      throw new IdentityApiError(response.status, errorMessage(body, `Identity API вернул ошибку ${response.status}`));
    }
    if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

function persistTokens(tokens: IdentityContract.TokenPair): void {
  writeTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1_000,
  });
}

export async function refreshIdentityTokens(): Promise<void> {
  if (refreshRequest) return refreshRequest;
  const stored = readTokens();
  if (!stored) throw new IdentityApiError(401, "Сессия не найдена");

  refreshRequest = rawRequest<IdentityContract.TokenPair>("/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: stored.refreshToken }),
  })
    .then(persistTokens)
    .catch((error: unknown) => {
      clearTokens();
      throw error;
    })
    .finally(() => {
      refreshRequest = null;
    });
  return refreshRequest;
}

async function authorizedRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const stored = readTokens();
  if (!stored) throw new IdentityApiError(401, "Войдите в аккаунт");

  try {
    return await rawRequest<T>(path, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${stored.accessToken}` },
    });
  } catch (error) {
    if (retry && error instanceof IdentityApiError && error.status === 401) {
      await refreshIdentityTokens();
      return authorizedRequest<T>(path, init, false);
    }
    throw error;
  }
}

export const identityApi = {
  async login(email: string, password: string): Promise<IdentityContract.UserInfo> {
    const tokens = await rawRequest<IdentityContract.TokenPair>("/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "password", username: email, password }),
    });
    persistTokens(tokens);
    try {
      return await authorizedRequest<IdentityContract.UserInfo>("/oauth/userinfo");
    } catch (error) {
      clearTokens();
      throw error;
    }
  },

  register(input: IdentityContract.Registration): Promise<IdentityContract.Account> {
    return rawRequest<IdentityContract.Account>("/accounts/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  userInfo(): Promise<IdentityContract.UserInfo> {
    return authorizedRequest<IdentityContract.UserInfo>("/oauth/userinfo");
  },

  account(accountId: string): Promise<IdentityContract.Account> {
    return authorizedRequest<IdentityContract.Account>(`/accounts/${accountId}`);
  },

  addIdentifier(accountId: string, input: IdentityContract.CreateIdentifier): Promise<IdentityContract.Identifier> {
    return authorizedRequest<IdentityContract.Identifier>(`/identifiers/${accountId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  updateIdentifierPreferences(
    accountId: string,
    identifierId: string,
    input: IdentityContract.IdentifierPreferences,
  ): Promise<IdentityContract.Identifier> {
    return authorizedRequest<IdentityContract.Identifier>(`/identifiers/${accountId}/${identifierId}/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  deleteIdentifier(accountId: string, identifierId: string): Promise<void> {
    return authorizedRequest<void>(`/identifiers/${accountId}/${identifierId}`, { method: "DELETE" });
  },

  deleteSession(accountId: string, sessionId: string): Promise<void> {
    return authorizedRequest<void>(`/sessions/${accountId}/${sessionId}`, { method: "DELETE" });
  },

  async logout(): Promise<void> {
    try {
      await authorizedRequest<void>("/oauth/logout", { method: "POST" }, false);
    } finally {
      clearTokens();
    }
  },
};
