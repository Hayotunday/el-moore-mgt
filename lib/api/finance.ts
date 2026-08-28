import { apiFetch } from "./client";
import type { FinancialTransaction, TransactionType } from "./types";

export interface FinanceFilter {
  type?: TransactionType;
  search?: string;
}

/** The live endpoint has no query filters — list is fetched in full and filtered client-side. */
export async function listTransactions(filter: FinanceFilter = {}): Promise<FinancialTransaction[]> {
  const all = await apiFetch<FinancialTransaction[]>("/finance/transactions");
  const search = filter.search?.trim().toLowerCase();
  return all
    .filter((t) => !filter.type || t.type === filter.type)
    .filter(
      (t) =>
        !search ||
        t.category.toLowerCase().includes(search) ||
        (t.note ?? "").toLowerCase().includes(search),
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getTransaction(id: string): Promise<FinancialTransaction> {
  return apiFetch<FinancialTransaction>(`/finance/transactions/${id}`);
}

/** ACCOUNTANT only. */
export async function createTransaction(input: {
  type: TransactionType;
  category: string;
  amount: string;
  date: string;
  saleId?: string;
  note?: string;
}): Promise<FinancialTransaction> {
  return apiFetch<FinancialTransaction>("/finance/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** ACCOUNTANT only. */
export async function updateTransaction(
  id: string,
  input: Partial<Pick<FinancialTransaction, "type" | "category" | "amount" | "date" | "note">>,
): Promise<FinancialTransaction> {
  return apiFetch<FinancialTransaction>(`/finance/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** OFFICE_ADMIN only. */
export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch<void>(`/finance/transactions/${id}`, { method: "DELETE" });
}

/** OFFICE_ADMIN or ACCOUNTANT. Response shape isn't documented — passed through as-is. */
export async function getFinanceSummary(): Promise<unknown> {
  return apiFetch("/finance/summary");
}
