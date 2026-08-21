import { apiFetch, IS_MOCK } from "./client";
import { delay, financialTransactions, uid } from "./mock-store";
import type { FinancialTransaction, TransactionType } from "./types";

export interface FinanceFilter {
  type?: TransactionType;
  category?: string;
  search?: string;
}

export async function listTransactions(
  filter: FinanceFilter = {},
): Promise<FinancialTransaction[]> {
  if (IS_MOCK) {
    await delay();
    const search = filter.search?.trim().toLowerCase();
    return financialTransactions
      .filter((t) => !filter.type || t.type === filter.type)
      .filter((t) => !filter.category || t.category === filter.category)
      .filter(
        (t) =>
          !search ||
          t.category.toLowerCase().includes(search) ||
          t.note?.toLowerCase().includes(search) ||
          t.recordedByName.toLowerCase().includes(search),
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return apiFetch<FinancialTransaction[]>("/finance/transactions");
}

export async function createTransaction(input: {
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
  recordedById: string;
  recordedByName: string;
}): Promise<FinancialTransaction> {
  if (IS_MOCK) {
    await delay(400);
    const newTxn: FinancialTransaction = { id: uid("txn"), saleId: null, ...input };
    financialTransactions.push(newTxn);
    return { ...newTxn };
  }
  return apiFetch<FinancialTransaction>("/finance/transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
