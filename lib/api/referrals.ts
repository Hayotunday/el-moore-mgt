import { apiFetch } from "./client";
import { listSales, type SaleWithDetails } from "./sales";
import type { Referral } from "./types";

export interface ReferralWithSale extends Referral {
  propertyId: string;
  saleAmount: number;
  buyerName: string;
}

function joinSale(referral: Referral, sales: SaleWithDetails[]): ReferralWithSale {
  const sale = sales.find((s) => s.id === referral.saleId);
  return {
    ...referral,
    propertyId: sale?.propertyId ?? "",
    saleAmount: sale ? Number(sale.totalAmount) : 0,
    buyerName: sale?.buyerName ?? "Unknown buyer",
  };
}

/** OFFICE_ADMIN only. */
export async function listReferrals(): Promise<ReferralWithSale[]> {
  const [raw, sales] = await Promise.all([apiFetch<Referral[]>("/referrals"), listSales()]);
  return raw
    .map((r) => joinSale(r, sales))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** AFFILIATE_MARKETER only — the referrals attributed to the authenticated marketer. */
export async function listMyReferrals(): Promise<Referral[]> {
  return apiFetch<Referral[]>("/referrals/mine");
}

/** OFFICE_ADMIN only. Response shape isn't documented — passed through as-is. */
export async function getReferralSummary(): Promise<unknown> {
  return apiFetch("/referrals/summary");
}

export async function getReferral(id: string): Promise<Referral> {
  return apiFetch<Referral>(`/referrals/${id}`);
}

/** OFFICE_ADMIN only. */
export async function markReferralPaid(id: string): Promise<Referral> {
  return apiFetch<Referral>(`/referrals/${id}/mark-paid`, { method: "PATCH" });
}
