import { apiFetch } from "./client";
import type { Contractor } from "./types";

export async function listContractors(): Promise<Contractor[]> {
  return apiFetch<Contractor[]>("/contractors");
}

export async function getContractor(id: string): Promise<Contractor> {
  return apiFetch<Contractor>(`/contractors/${id}`);
}

export async function createContractor(input: {
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  specialty?: string;
}): Promise<Contractor> {
  return apiFetch<Contractor>("/contractors", { method: "POST", body: JSON.stringify(input) });
}

export async function updateContractor(
  id: string,
  input: Partial<{ name: string; contactPhone: string; contactEmail: string; specialty: string }>,
): Promise<Contractor> {
  return apiFetch<Contractor>(`/contractors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteContractor(id: string): Promise<void> {
  await apiFetch<void>(`/contractors/${id}`, { method: "DELETE" });
}
