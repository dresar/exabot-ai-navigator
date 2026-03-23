/**
 * API base: use VITE_API_URL (e.g. http://localhost:3003) or dev proxy /api → backend.
 */
export function getApiBase(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env && String(env).trim().length > 0) {
    return `${String(env).replace(/\/$/, "")}/api/v1`;
  }
  return "/api/v1";
}

/** WebSocket origin (no path). Dev default targets backend :3003 when FE runs on Vite :8083. */
export function getWsBase(): string {
  const env = import.meta.env.VITE_WS_URL;
  if (env && String(env).trim().length > 0) {
    return String(env).replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "ws://127.0.0.1:3003";
  }
  const loc = window.location;
  const proto = loc.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${loc.host}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, isRetry = false): Promise<T> {
  const { getAccessToken, clearAuth, tryRefreshOnce } = await import("./auth");
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getApiBase()}${path}`, { ...init, headers });

  if (res.status === 401) {
    if (!path.startsWith("/auth/") && !isRetry && (await tryRefreshOnce())) {
      return apiFetch<T>(path, init, true);
    }
    clearAuth();
    if (!path.startsWith("/auth/")) {
      window.location.assign("/login");
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(res.statusText || "Request failed", res.status, text);
  }
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
