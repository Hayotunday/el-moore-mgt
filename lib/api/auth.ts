import { apiFetch, IS_MOCK } from "./client";
import { delay, managementUsers, DEMO_PASSWORD, DEMO_ACCOUNTS } from "./mock-store";
import type { ManagementUser } from "./types";

export interface LoginResult {
  user: ManagementUser;
  token: string;
}

export { DEMO_PASSWORD, DEMO_ACCOUNTS };

export async function login(email: string, password: string): Promise<LoginResult> {
  if (IS_MOCK) {
    await delay(600);
    const user = managementUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!user || password !== DEMO_PASSWORD) {
      throw new Error("Invalid email or password.");
    }
    return { user: { ...user }, token: `mock-token.${user.id}` };
  }
  return apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchProfile(userId: string): Promise<ManagementUser | null> {
  if (IS_MOCK) {
    await delay(150);
    const user = managementUsers.find((u) => u.id === userId);
    return user ? { ...user } : null;
  }
  return apiFetch<ManagementUser>("/auth/me");
}

/** Resolves a mock token back to a user id. Real backend would decode the JWT instead. */
export function userIdFromMockToken(token: string): string | null {
  if (!token.startsWith("mock-token.")) return null;
  return token.slice("mock-token.".length);
}
