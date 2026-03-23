import { getApiBase } from "./api";

const ACCESS = "exabot_access_token";
const REFRESH = "exabot_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refresh);
}

/** Update only access token after `/auth/refresh`. */
export function setAccessToken(access: string) {
  localStorage.setItem(ACCESS, access);
}

export function clearAuth() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

/** Single-flight refresh to avoid parallel storms on 401. */
let refreshInFlight: Promise<boolean> | null = null;

export async function tryRefreshOnce(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const rt = getRefreshToken();
  if (!rt) return false;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${getApiBase()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { access_token: string };
      setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/** Revoke refresh token on server, then clear local storage. */
export async function logoutRequest(): Promise<void> {
  const rt = getRefreshToken();
  if (rt) {
    try {
      await fetch(`${getApiBase()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
    } catch {
      /* network errors: still clear client session */
    }
  }
  clearAuth();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

function errorMessageFromBody(text: string, statusText: string): string {
  const trimmed = text.trim();
  if (!trimmed) return statusText || "Request failed";
  try {
    const j = JSON.parse(trimmed) as { detail?: string | Array<{ msg?: string }> };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      return j.detail.map((x) => (typeof x === "object" && x && "msg" in x ? String((x as { msg?: string }).msg) : JSON.stringify(x))).join("; ");
    }
  } catch {
    /* not JSON (e.g. plain "Internal Server Error") */
  }
  return trimmed.length > 300 ? trimmed.slice(0, 300) + "…" : trimmed;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(errorMessageFromBody(text, res.statusText));
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  return postJson<TokenResponse>("/auth/login", { email, password });
}

/** Development API only: POST /auth/dev-login — JWT for DB user `DEV_QUICK_LOGIN_EMAIL`, no password in client. */
export async function devQuickLoginRequest(): Promise<TokenResponse> {
  return postJson<TokenResponse>("/auth/dev-login", {});
}

export async function registerRequest(
  email: string,
  username: string,
  password: string
): Promise<TokenResponse> {
  return postJson<TokenResponse>("/auth/register", { email, username, password });
}

export type UserMe = {
  id: string;
  email: string;
  username: string;
  plan: string;
  is_active: boolean;
};

export async function fetchMe(): Promise<UserMe> {
  const { apiFetch } = await import("./api");
  return apiFetch<UserMe>("/users/me");
}
