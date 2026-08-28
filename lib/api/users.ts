import { apiFetch, toQueryString, uploadToPresignedUrl } from "./client";
import type { ManagementUser, MarketerStatus, Role } from "./types";

export async function listUsers(role?: Role): Promise<ManagementUser[]> {
  return apiFetch<ManagementUser[]>(`/users${toQueryString({ role })}`);
}

export async function getUser(id: string): Promise<ManagementUser> {
  return apiFetch<ManagementUser>(`/users/${id}`);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<ManagementUser> {
  return apiFetch<ManagementUser>("/users", { method: "POST", body: JSON.stringify(input) });
}

export async function updateUser(
  id: string,
  input: Partial<{
    name: string;
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
export async function assignUserRole(id: string, role: Role): Promise<ManagementUser> {
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

export async function uploadUserAvatar(id: string, file: File): Promise<string> {
  const { uploadUrl, avatarUrl } = await apiFetch<{ uploadUrl: string; avatarUrl: string }>(
    `/users/${id}/avatar`,
    { method: "POST", body: JSON.stringify({ filename: file.name }) },
  );
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
