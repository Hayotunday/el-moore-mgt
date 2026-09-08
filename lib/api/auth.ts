import { apiFetch, setStoredToken } from "./client";
import type { ManagementUser } from "./types";

export interface LoginResult {
  user: ManagementUser;
  token: string;
}

interface RawAuthResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: ManagementUser;
}

function extractToken(raw: RawAuthResponse): string {
  const token = raw.accessToken ?? raw.access_token ?? raw.token;
  if (!token) throw new Error("Login response did not include an access token.");
  return token;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const raw = await apiFetch<RawAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const token = extractToken(raw);
  if (raw.user) return { user: raw.user, token };

  // Response didn't embed the user — fetch it now that we have a token.
  setStoredToken(token);
  const user = await fetchProfile();
  return { user, token };
}

export async function fetchProfile(): Promise<ManagementUser> {
  return apiFetch<ManagementUser>("/auth/me");
}

interface RegisterInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput): Promise<void> {
  await apiFetch<void>("/auth/register", { method: "POST", body: JSON.stringify(input) });
}

/** Affiliate marketer (renamed from "external marketer" — same behavior, requires
 *  MD/GM approval after email verification, see approveAffiliateMarketer). */
export async function registerAffiliateMarketer(input: RegisterInput): Promise<void> {
  await apiFetch<void>("/auth/register/affiliate-marketer", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyCode(input: { email: string; code: string }): Promise<void> {
  await apiFetch<void>("/auth/verify-code", { method: "POST", body: JSON.stringify(input) });
}

export async function resendVerification(email: string): Promise<void> {
  await apiFetch<void>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** MD or GM only. The marketer must have verified their email before approval. */
export async function approveAffiliateMarketer(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  await apiFetch<void>(`/auth/affiliate-marketer/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function refreshAccessToken(): Promise<string> {
  const raw = await apiFetch<RawAuthResponse>("/auth/refresh", { method: "POST" });
  return extractToken(raw);
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/auth/logout", { method: "POST" });
  } catch {
    // best-effort — local session is cleared regardless by the caller
  }
}
