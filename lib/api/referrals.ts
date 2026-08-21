import { apiFetch, IS_MOCK } from "./client";
import { delay, referrals, sales, uid } from "./mock-store";
import type { Referral } from "./types";

export interface ReferralWithSale extends Referral {
  propertyId: string;
  saleAmount: number;
  buyerName: string;
}

function joinSale(referral: Referral): ReferralWithSale {
  const sale = sales.find((s) => s.id === referral.saleId);
  return {
    ...referral,
    propertyId: sale?.propertyId ?? "",
    saleAmount: sale?.totalAmount ?? 0,
    buyerName: sale?.buyerName ?? "Unknown buyer",
  };
}

export async function listReferrals(): Promise<ReferralWithSale[]> {
  if (IS_MOCK) {
    await delay();
    return referrals.map(joinSale).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return apiFetch<ReferralWithSale[]>("/referrals");
}

export async function tagReferrer(input: {
  saleId: string;
  marketerId: string;
  marketerName: string;
  commissionAmount: number;
}): Promise<Referral> {
  if (IS_MOCK) {
    await delay(400);
    const sale = sales.find((s) => s.id === input.saleId);
    if (!sale) throw new Error("Sale not found");
    sale.marketerId = input.marketerId;
    sale.marketerName = input.marketerName;

    const newReferral: Referral = {
      id: uid("ref"),
      status: "PENDING",
      paidAt: null,
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    referrals.push(newReferral);
    return { ...newReferral };
  }
  return apiFetch<Referral>("/referrals", { method: "POST", body: JSON.stringify(input) });
}

export async function markReferralPaid(id: string): Promise<Referral> {
  if (IS_MOCK) {
    await delay(300);
    const referral = referrals.find((r) => r.id === id);
    if (!referral) throw new Error("Referral not found");
    referral.status = "PAID";
    referral.paidAt = new Date().toISOString().slice(0, 10);
    return { ...referral };
  }
  return apiFetch<Referral>(`/referrals/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "PAID" }),
  });
}
