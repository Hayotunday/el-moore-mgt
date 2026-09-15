const DEFAULT_API_BASE_URL = "https://el-moore.onrender.com";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

/**
 * A presigned R2 *upload* URL (what `uploadUrl` always is) points at Cloudflare's
 * S3-compatible API endpoint — `<bucket>.<accountId>.r2.cloudflarestorage.com` —
 * which only accepts signed S3 requests. It is never a valid public GET URL: the
 * real public delivery domain is a completely different host (an r2.dev subdomain
 * or a custom domain bound to the bucket). Naively stripping the query string off
 * an upload URL and calling that the "public" URL — an easy mistake, since it
 * *looks* like a plain link once the signature is gone — silently produces a link
 * that 400s in the browser instead of showing the image.
 *
 * These two are the actual public bases for this project's two R2 buckets, set
 * via env so they can be corrected without a code change if Cloudflare's assigned
 * domains differ from what's configured here — verify them against the R2
 * dashboard for this account if uploaded images/documents ever come back 400.
 */
export const R2_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  "https://pub-7a398cb5a1604da7a1ff82accf47a10f.r2.dev";
export const R2_PRIVATE_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PRIVATE_BASE_URL ||
  "https://pub-c96abe9a0fca4f158e5ff5a0d5b1f59b.r2.dev";

/**
 * Turns a presigned R2 *upload* URL into the real public URL an `<img>`/link can
 * actually load, by keeping only its path (the storage key) and re-anchoring that
 * to the bucket's real public base — never the S3 API host the upload URL itself
 * points at. Pass this result to a `.../confirm` endpoint's `imageUrl`/`fileUrl`.
 */
export function toPublicR2Url(
  presignedUploadUrl: string,
  publicBaseUrl: string,
): string {
  const path = presignedUploadUrl
    .split("?")[0]
    .replace(/^https?:\/\/[^/]+/, "");
  return `${publicBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * This app is the management side only — the marketer portal is a separate
 * deployment (a separate repo entirely) with its own token under its own
 * key, so there's no realm to detect or thread through here.
 */
const TOKEN_KEY = "el-moore-management-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

/** Dispatched when the refresh-token cookie itself is invalid/expired, so
 *  AuthProvider can clear its in-memory user immediately instead of leaving the UI
 *  looking "logged in" while every request 401s. */
const AUTH_EXPIRED_EVENT = "el-moore-auth-expired";

export function onAuthExpired(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
}

function announceAuthExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function extractMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

interface SuccessEnvelope<T> {
  data: T;
  message: string;
  statusCode: number;
  success: true;
}

/** Most (not all — e.g. /health) success responses are wrapped in `{ data, message, statusCode, success }`. */
function unwrap<T>(body: unknown): T {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    "success" in body &&
    (body as { success?: unknown }).success === true
  ) {
    return (body as SuccessEnvelope<T>).data;
  }
  return body as T;
}

interface RawTokenResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
}

function extractToken(raw: RawTokenResponse): string | null {
  return raw.accessToken ?? raw.access_token ?? raw.token ?? null;
}

/**
 * Calls POST /auth/refresh directly (not through apiFetch, to avoid recursing back
 * into the 401-retry below) using the HttpOnly refresh-token cookie. Returns the new
 * access token, or null if the refresh token itself is invalid/expired.
 */
async function rawRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    return extractToken(unwrap<RawTokenResponse>(JSON.parse(text)));
  } catch {
    return null;
  }
}

// Access-token refreshes are deduped so a burst of requests that all hit a 401
// at once (e.g. right after the token expires) triggers exactly one
// /auth/refresh call, not one per request.
let refreshInFlight: Promise<string | null> | null = null;

function refreshOnce(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = rawRefresh()
      .then((newToken) => {
        setStoredToken(newToken);
        if (!newToken) announceAuthExpired();
        return newToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Fetch wrapper for the live el-moore-api (NestJS) backend at API_BASE_URL.
 * `credentials: "include"` is required so the HttpOnly refresh-token cookie the
 * backend sets on login/refresh is sent back on subsequent requests.
 *
 * The backend's access tokens are short-lived (they expire after a few minutes of
 * inactivity, which is why a stale tab used to start throwing 401s until you
 * manually logged back in). On a 401 from a request that actually sent a token,
 * this silently refreshes via the cookie and retries the request once before
 * giving up.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token = getStoredToken();

  const send = (authToken: string | null) =>
    fetch(`${API_BASE_URL}/api${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });

  let res = await send(token);

  if (res.status === 401 && token && path !== "/auth/refresh") {
    const refreshed = await refreshOnce();
    if (refreshed) {
      token = refreshed;
      res = await send(token);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(extractMessage(body, res.statusText), res.status, body);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return unwrap<T>(JSON.parse(text));
}

/** Raw PUT of a File to a presigned upload URL (R2). Not routed through apiFetch — no auth header, no /api prefix. */
export async function uploadToPresignedUrl(
  url: string,
  file: File,
): Promise<void> {
  // The backend is expected to return an absolute URL (a presigned R2/S3 link). If it
  // ever returns a relative path instead, resolving it against the current page would
  // silently hit this frontend's own origin instead of the API — so anchor it to
  // API_BASE_URL explicitly rather than trusting the browser's relative resolution.
  const absoluteUrl = /^https?:\/\//i.test(url)
    ? url
    : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  const res = await fetch(absoluteUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) {
    throw new ApiError(`Upload failed (${res.status})`, res.status);
  }
}

export function toQueryString(
  params: Record<string, string | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  );
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries as [string, string][]).toString()}`;
}
