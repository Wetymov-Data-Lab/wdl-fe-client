import { getAccessToken } from "@/shared/auth/token-storage";
import { refreshIdentityTokens } from "@/entities/identity/api/identity-api";

const coreApiUrl = import.meta.env.CORE_API_URL.replace(/\/$/, "");
const requestTimeoutMs = Number(import.meta.env.CORE_API_TIMEOUT_MS);
const isAuthEnabled = import.meta.env.AUTH_ENABLED === "true";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// TODO: посмотреть варианты ненативного fetch
export async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
  const accessToken = isAuthEnabled ? getAccessToken() : null;

  const response = await fetch(`${coreApiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
    signal: init?.signal ?? controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    if (response.status === 401 && isAuthEnabled && retry && getAccessToken()) {
      await refreshIdentityTokens();
      return request<T>(path, init, false);
    }
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(response.status, body?.detail ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
