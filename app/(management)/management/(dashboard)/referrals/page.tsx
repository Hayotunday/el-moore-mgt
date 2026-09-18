"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Share2, Info, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from "@/components/management/data-table";
import { Button } from "@/components/ui/button";
import { listReferrals, markReferralPaid, type ReferralWithSale } from "@/lib/api/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useConfirm } from "@/contexts/confirm-dialog-context";

export default function ReferralsPage() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralWithSale[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReferrals(await listReferrals());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load referrals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (referral: ReferralWithSale) => {
    const ok = await confirm({
      title: "Mark Commission as Paid?",
      description: `This will record a payout of ${formatCurrency(referral.commissionAmount)} to the marketer. This action cannot be reversed.`,
      confirmLabel: "Mark as Paid",
    });
    if (!ok) return;
    setPayingId(referral.id);
    try {
      await markReferralPaid(referral.id);
      toast.success("Commission marked as paid.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update referral.");
    } finally {
      setPayingId(null);
    }
  };

  const pendingTotal = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + Number(r.commissionAmount), 0);
  const paidTotal = referrals
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + Number(r.commissionAmount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Referrals & Commissions"
        subtitle="Every commission earned by an external marketer, and its payout status."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Referrals" value={referrals.length} icon={<Share2 className="h-6 w-6" />} />
        <StatCard
          label="Pending Commission"
          value={formatCurrency(pendingTotal)}
          icon={<Share2 className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          label="Paid Commission"
          value={formatCurrency(paidTotal)}
          icon={<Share2 className="h-6 w-6" />}
          variant="gold"
        />
      </div>

      <div className="flex items-start gap-3 rounded-md bg-muted/40 p-4">
        <Info className="h-4 w-4 text-gold mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          A referral is created automatically when a sale is recorded with an external
          marketer attributed to it — there&apos;s no separate step to tag one onto a sale
          after the fact.{" "}
          <Link
            href="/management/sales"
            className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-2"
          >
            Record a sale <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Marketer</DataTableHeadCell>
          <DataTableHeadCell>Buyer</DataTableHeadCell>
          <DataTableHeadCell align="right">Sale Amount</DataTableHeadCell>
          <DataTableHeadCell align="right">Commission</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="center">Action</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && referrals.length === 0 && <DataTableEmpty colSpan={6} />}
          {referrals.map((referral, idx) => (
            <DataTableRow key={referral.id} index={idx}>
              <DataTableCell className="font-medium">{referral.marketerId}</DataTableCell>
              <DataTableCell>{referral.buyerName}</DataTableCell>
              <DataTableCell align="right">{formatCurrency(referral.saleAmount)}</DataTableCell>
              <DataTableCell align="right">{formatCurrency(referral.commissionAmount)}</DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={referral.status} />
              </DataTableCell>
              <DataTableCell align="center">
                {referral.status === "PENDING" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkPaid(referral)}
                    disabled={payingId === referral.id}
                  >
                    {payingId === referral.id ? "Saving…" : "Mark as Paid"}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Paid {referral.paidAt ? formatDate(referral.paidAt) : ""}
                  </span>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
