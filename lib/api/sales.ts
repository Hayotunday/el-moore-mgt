import { apiFetch, uploadToPresignedUrl } from "./client";
import { listProperties } from "./properties";
import type {
  InstallmentPayment,
  InstallmentPlan,
  Sale,
  SaleDocument,
  SaleDocumentType,
  SaleType,
} from "./types";

export interface SaleWithDetails extends Sale {
  propertyTitle: string;
  plan: InstallmentPlan | null;
  payments: InstallmentPayment[];
  amountPaid: number;
  balance: number;
}

async function joinDetails(sale: Sale, propertyTitle: string): Promise<SaleWithDetails> {
  let plan: InstallmentPlan | null = null;
  let payments: InstallmentPayment[] = [];
  if (sale.saleType === "INSTALLMENT") {
    plan = await getInstallmentPlan(sale.id).catch(() => null);
    payments = await listPayments(sale.id).catch(() => []);
  }
  const amountPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  return {
    ...sale,
    propertyTitle,
    plan,
    payments,
    amountPaid,
    balance: Number(sale.totalAmount) - amountPaid,
  };
}

/** OFFICE_ADMIN, TEAM_LEAD, or ACCOUNTANT. */
export async function listSales(saleType?: SaleType): Promise<SaleWithDetails[]> {
  const [raw, properties] = await Promise.all([
    apiFetch<Sale[]>("/sales"),
    listProperties(),
  ]);
  const filtered = saleType ? raw.filter((s) => s.saleType === saleType) : raw;
  const withDetails = await Promise.all(
    filtered.map((s) => {
      const property = properties.find((p) => p.id === s.propertyId);
      return joinDetails(s, property?.title ?? "Unknown property");
    }),
  );
  return withDetails.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Sales with no marketer attributed yet — for reference; the real API only attaches a
 * marketer at creation time (CreateSaleDto.marketerId), there's no endpoint to tag one
 * onto an existing sale afterward. */
export async function listUnattributedSales(): Promise<SaleWithDetails[]> {
  const all = await listSales();
  return all.filter((s) => !s.marketerId);
}

/** OFFICE_ADMIN, TEAM_LEAD, or ACCOUNTANT. Installment sales past their expected payment
 * date that aren't fully paid off yet. */
export async function listOverdueSales(): Promise<Sale[]> {
  return apiFetch<Sale[]>("/sales/overdue");
}

/**
 * Not wired to any page yet — the Sales page currently composes its stats and tables
 * from `listSales()` + client-side joins, which already works. This purpose-built
 * endpoint could replace that, but its response shape isn't documented and hasn't been
 * verified against a live authenticated call.
 */
export async function getSalesDashboard(params: {
  saleType?: SaleType;
  limit?: number;
  offset?: number;
}): Promise<unknown> {
  const query = new URLSearchParams();
  if (params.saleType) query.set("saleType", params.saleType);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return apiFetch(`/sales/dashboard${qs ? `?${qs}` : ""}`);
}

export async function getSale(id: string): Promise<Sale> {
  return apiFetch<Sale>(`/sales/${id}`);
}

/** TEAM_LEAD or OFFICE_ADMIN. Updates buyer info, sale type, amount, or assigned staff. */
export async function updateSale(
  id: string,
  input: Partial<{
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    saleType: SaleType;
    totalAmount: string;
    soldById: string;
  }>,
): Promise<Sale> {
  return apiFetch<Sale>(`/sales/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

/** OFFICE_ADMIN only. Voids the sale and releases the property back to AVAILABLE. */
export async function voidSale(id: string): Promise<void> {
  await apiFetch<void>(`/sales/${id}`, { method: "DELETE" });
}

/**
 * TEAM_LEAD or OFFICE_ADMIN. A property can only be sold once. Passing `marketerId`
 * attributes an external marketer to the sale, which auto-creates a referral.
 */
export async function createSale(input: {
  propertyId: string;
  customerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  saleType: SaleType;
  totalAmount: string;
  soldById?: string;
  marketerId?: string;
}): Promise<Sale> {
  return apiFetch<Sale>("/sales", { method: "POST", body: JSON.stringify(input) });
}

/** TEAM_LEAD or OFFICE_ADMIN. Only installment sales; one plan per sale. */
export async function createInstallmentPlan(
  saleId: string,
  input: { numberOfInstallments: number; startDate: string },
): Promise<InstallmentPlan> {
  return apiFetch<InstallmentPlan>(`/sales/${saleId}/installment-plan`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getInstallmentPlan(saleId: string): Promise<InstallmentPlan | null> {
  try {
    return await apiFetch<InstallmentPlan>(`/sales/${saleId}/installment-plan`);
  } catch {
    return null;
  }
}

export async function listPayments(saleId: string): Promise<InstallmentPayment[]> {
  return apiFetch<InstallmentPayment[]>(`/sales/${saleId}/installment-plan/payments`);
}

/** TEAM_LEAD, OFFICE_ADMIN, or ACCOUNTANT. */
export async function addInstallmentPayment(
  saleId: string,
  input: { amountPaid: string; paidAt: string; note?: string },
): Promise<InstallmentPayment> {
  return apiFetch<InstallmentPayment>(`/sales/${saleId}/installment-plan/payments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listSaleDocuments(saleId: string): Promise<SaleDocument[]> {
  return apiFetch<SaleDocument[]>(`/sales/${saleId}/documents`);
}

/** TEAM_LEAD or OFFICE_ADMIN. Uploads to a private R2 bucket via presigned URL. */
export async function uploadSaleDocument(
  saleId: string,
  file: File,
  documentType: SaleDocumentType,
): Promise<SaleDocument> {
  const { uploadUrl, docId } = await apiFetch<{ uploadUrl: string; docId: string }>(
    `/sales/${saleId}/documents`,
    {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentType: file.type, documentType }),
    },
  );
  await uploadToPresignedUrl(uploadUrl, file);
  return apiFetch<SaleDocument>(`/sales/${saleId}/documents/${docId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ fileUrl: uploadUrl.split("?")[0] }),
  });
}

/** Returns a short-lived (15 min) signed download URL for a private sale document. */
export async function getSaleDocumentUrl(saleId: string, docId: string): Promise<string> {
  const res = await apiFetch<{ url: string }>(`/sales/${saleId}/documents/${docId}`);
  return res.url;
}

export async function removeSaleDocument(saleId: string, docId: string): Promise<void> {
  await apiFetch<void>(`/sales/${saleId}/documents/${docId}`, { method: "DELETE" });
}
