import { apiFetch, IS_MOCK } from "./client";
import { delay, managementUsers, uid } from "./mock-store";
import type { ManagementUser, Role } from "./types";

export async function listUsers(): Promise<ManagementUser[]> {
  if (IS_MOCK) {
    await delay();
    return [...managementUsers];
  }
  return apiFetch<ManagementUser[]>("/users");
}

export async function updateUserRole(userId: string, role: Role): Promise<ManagementUser> {
  if (IS_MOCK) {
    await delay(300);
    const user = managementUsers.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.role = role;
    return { ...user };
  }
  return apiFetch<ManagementUser>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function inviteUser(input: {
  name: string;
  email: string;
  role: Role;
}): Promise<ManagementUser> {
  if (IS_MOCK) {
    await delay(400);
    const newUser: ManagementUser = {
      id: uid("u"),
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    managementUsers.push(newUser);
    return { ...newUser };
  }
  return apiFetch<ManagementUser>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
