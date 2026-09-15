import { apiFetch } from "./client";
import type { Invite, ManagementUser, Role } from "./types";

/** MD/GM only. MD can invite any role; GM can invite any role below MD. */
export async function sendInvite(input: {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: Role;
}): Promise<Invite> {
  return apiFetch<Invite>("/invites", { method: "POST", body: JSON.stringify(input) });
}

/** MD/GM only — invites sent by the current user. */
export async function listMyInvites(): Promise<Invite[]> {
  return apiFetch<Invite[]>("/invites");
}

/** MD/GM only. Generates a new token and re-sends the email; the old token is invalidated. */
export async function resendInvite(id: string): Promise<void> {
  await apiFetch<void>(`/invites/${id}/resend`, { method: "POST" });
}

/** MD/GM only. */
export async function revokeInvite(id: string): Promise<void> {
  await apiFetch<void>(`/invites/${id}`, { method: "DELETE" });
}

/** Public — used by the invite claim page to display who/what role before accepting. */
export async function verifyInviteToken(token: string): Promise<Invite> {
  return apiFetch<Invite>("/invites/verify", { method: "POST", body: JSON.stringify({ token }) });
}

/** Public. Sets the pre-assigned role and auto-verifies the email. */
export async function acceptInvite(input: { token: string; password: string }): Promise<{
  user?: ManagementUser;
}> {
  return apiFetch("/invites/accept", { method: "POST", body: JSON.stringify(input) });
}
