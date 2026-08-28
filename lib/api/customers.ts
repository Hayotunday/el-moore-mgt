import { apiFetch, toQueryString } from "./client";
import type { Customer } from "./types";

/** OFFICE_ADMIN, TEAM_LEAD, CUSTOMER_CARE, or ACCOUNTANT. */
export async function listCustomers(search?: string): Promise<Customer[]> {
  return apiFetch<Customer[]>(`/customers${toQueryString({ search })}`);
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`);
}

export async function createCustomer(input: {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
}): Promise<Customer> {
  return apiFetch<Customer>("/customers", { method: "POST", body: JSON.stringify(input) });
}

export async function updateCustomer(
  id: string,
  input: Partial<Pick<Customer, "fullName" | "phone" | "email" | "dateOfBirth">>,
): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** OFFICE_ADMIN only. */
export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch<void>(`/customers/${id}`, { method: "DELETE" });
}
