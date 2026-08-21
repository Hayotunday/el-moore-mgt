import { apiFetch, IS_MOCK } from "./client";
import {
  delay,
  sales,
  properties,
  installmentPlans,
  installmentPayments,
  uid,
} from "./mock-store";
import type { InstallmentPayment, InstallmentPlan, Sale, SaleType } from "./types";

export interface SaleWithDetails extends Sale {
  propertyTitle: string;
  plan: InstallmentPlan | null;
  payments: InstallmentPayment[];
  amountPaid: number;
  balance: number;
}

function joinDetails(sale: Sale): SaleWithDetails {
  const property = properties.find((p) => p.id === sale.propertyId);
  const plan = installmentPlans.find((p) => p.saleId === sale.id) ?? null;
  const payments = installmentPayments.filter((p) => p.saleId === sale.id);
  const amountPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  return {
    ...sale,
    propertyTitle: property?.title ?? "Unknown property",
    plan,
    payments,
    amountPaid,
    balance: sale.totalAmount - amountPaid,
  };
}

export async function listSales(saleType?: SaleType): Promise<SaleWithDetails[]> {
  if (IS_MOCK) {
    await delay();
    return sales
      .filter((s) => !saleType || s.saleType === saleType)
      .map(joinDetails)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return apiFetch<SaleWithDetails[]>(`/sales${saleType ? `?saleType=${saleType}` : ""}`);
}

/** Sales that haven't yet been attributed to a referring marketer — used by the tagging form. */
export async function listUnreferredSales(): Promise<SaleWithDetails[]> {
  const all = await listSales();
  return all.filter((s) => !s.marketerId);
}

export async function createSale(input: {
  propertyId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  saleType: SaleType;
  totalAmount: number;
  soldById?: string | null;
  soldByName?: string | null;
}): Promise<Sale> {
  if (IS_MOCK) {
    await delay(400);
    const newSale: Sale = {
      id: uid("sale"),
      marketerId: null,
      marketerName: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    sales.push(newSale);
    const property = properties.find((p) => p.id === input.propertyId);
    if (property) property.status = "SOLD";
    return { ...newSale };
  }
  return apiFetch<Sale>("/sales", { method: "POST", body: JSON.stringify(input) });
}

export async function addInstallmentPayment(input: {
  saleId: string;
  amountPaid: number;
  paidAt: string;
  note?: string;
}): Promise<InstallmentPayment> {
  if (IS_MOCK) {
    await delay(300);
    const payment: InstallmentPayment = { id: uid("ip"), ...input };
    installmentPayments.push(payment);
    return { ...payment };
  }
  return apiFetch<InstallmentPayment>("/sales/installment-payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
