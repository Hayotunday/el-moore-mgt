import { apiFetch } from "./client";
import { listSales, type SaleWithDetails } from "./sales";
import type { Referral } from "./types";

export interface ReferralWithSale extends Referral {
  propertyId: string;
  saleAmount: number;
  buyerName: string;
}

export interface ReferralDashboardReferral {
  id: string;
  marketerId: string;
  marketer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  saleId: string;
  sale: {
    id: string;
    propertyId: string;
    propertyName: string;
    totalAmount: number;
    saleType: string;
    status: string;
    commissionRate: number | null;
  } | null;
  commissionAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface ReferralDashboardSummary {
  [status: string]: { count: number; total: number };
}

export interface ReferralDashboardResponse {
  summary: ReferralDashboardSummary;
  referrals: ReferralDashboardReferral[];
}

function joinSale(referral: Referral, sales: any[]): ReferralWithSale {
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

/** OFFICE_ADMIN only — paginated with summary stats. */
export async function getReferralsDashboard(params?: {
  limit?: number;
  offset?: number;
}): Promise<ReferralDashboardResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return apiFetch<ReferralDashboardResponse>(`/referrals/dashboard${qs ? `?${qs}` : ""}`);
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
