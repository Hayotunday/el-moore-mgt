import { apiFetch, toQueryString } from "./client";
import type { Customer, Sale } from "./types";

/** OFFICE_ADMIN, TEAM_LEAD, CUSTOMER_CARE, or ACCOUNTANT. */
export async function listCustomers(search?: string): Promise<Customer[]> {
  return apiFetch<Customer[]>(`/customers${toQueryString({ search })}`);
}

/**
 * Not wired to any page yet — the Customers page currently composes its stats and table
 * from `listCustomers()` + per-customer `getCustomerSales()`, which already works. This
 * purpose-built endpoint could replace that, but its response shape isn't documented and
 * hasn't been verified against a live authenticated call.
 */
export async function getCustomersDashboard(params: {
  search?: string;
  saleType?: "OUTRIGHT" | "INSTALLMENT";
  limit?: number;
  offset?: number;
}): Promise<unknown> {
  return apiFetch(
    `/customers/dashboard${toQueryString({
      search: params.search,
      saleType: params.saleType,
      limit: params.limit ? String(params.limit) : undefined,
      offset: params.offset ? String(params.offset) : undefined,
    })}`,
  );
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

/**
 * OFFICE_ADMIN, TEAM_LEAD, CUSTOMER_CARE, or ACCOUNTANT. Use this instead of filtering
 * the admin-only `/sales` list client-side — CUSTOMER_CARE can view this page but can't
 * call `GET /sales`, so per-customer purchase history has to come from here.
 */
export async function getCustomerSales(customerId: string): Promise<Sale[]> {
  return apiFetch<Sale[]>(`/customers/${customerId}/sales`);
}
