import { apiFetch, toQueryString, uploadToPresignedUrl } from "./client";
import type { ManagementUser, MarketerStatus, Role } from "./types";

export async function listUsers(role?: Role): Promise<ManagementUser[]> {
  return apiFetch<ManagementUser[]>(`/users${toQueryString({ role })}`);
}

/**
 * Not wired to any page yet — the Users & Roles page currently composes its stats and
 * table from `listUsers()` client-side, which already works. This purpose-built endpoint
 * could replace that, but its exact response shape isn't documented and hasn't been
 * verified against a live authenticated call, so swapping it in is left for later rather
 * than guessed at.
 */
export async function getUsersDashboard(params: {
  search?: string;
  role?: Role;
  limit?: number;
  offset?: number;
}): Promise<unknown> {
  return apiFetch(
    `/users/dashboard${toQueryString({
      search: params.search,
      role: params.role,
      limit: params.limit ? String(params.limit) : undefined,
      offset: params.offset ? String(params.offset) : undefined,
    })}`,
  );
}

export async function getUser(id: string): Promise<ManagementUser> {
  return apiFetch<ManagementUser>(`/users/${id}`);
}

export async function createUser(input: {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}): Promise<ManagementUser> {
  return apiFetch<ManagementUser>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateUser(
  id: string,
  input: Partial<{
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    isActive: boolean;
    marketerStatus: MarketerStatus;
  }>,
): Promise<ManagementUser> {
  return apiFetch<ManagementUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Soft-deactivates the user so they can no longer log in. */
export async function deactivateUser(id: string): Promise<void> {
  await apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}

/** MD or GM only. */
export async function assignUserRole(
  id: string,
  role: Role,
): Promise<ManagementUser> {
  return apiFetch<ManagementUser>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/** MD or GM only. */
export async function setMarketerStatus(
  id: string,
  status: MarketerStatus,
): Promise<ManagementUser> {
  return apiFetch<ManagementUser>(`/users/${id}/marketer-status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function uploadUserAvatar(
  id: string,
  file: File,
): Promise<string> {
  const { uploadUrl, publicUrl } = await apiFetch<{
    uploadUrl: string;
    publicUrl: string;
  }>(`/users/${id}/avatar`, {
    method: "POST",
    body: JSON.stringify({ filename: file.name }),
  });
  const avatarUrl = publicUrl;
  await uploadToPresignedUrl(uploadUrl, file);
  await apiFetch<void>(`/users/${id}/avatar/confirm`, {
    method: "POST",
    body: JSON.stringify({ avatarUrl }),
  });
  return avatarUrl;
}

export async function removeUserAvatar(id: string): Promise<void> {
  await apiFetch<void>(`/users/${id}/avatar`, { method: "DELETE" });
}
