"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Share2, Info, ArrowRight, Eye } from "lucide-react";
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
import { getReferralsDashboard, markReferralPaid, type ReferralDashboardReferral, type ReferralDashboardResponse } from "@/lib/api/referrals";
import { formatCurrency, formatDate, getFullName } from "@/lib/utils";
import { useConfirm } from "@/contexts/confirm-dialog-context";

export default function ReferralsPage() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralDashboardReferral[]>([]);
  const [summary, setSummary] = useState<ReferralDashboardResponse["summary"]>({});
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const dashboard = await getReferralsDashboard({ limit: 50 });
      setReferrals(dashboard.referrals);
      setSummary(dashboard.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load referrals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (referral: ReferralDashboardReferral) => {
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

  const pendingTotal = summary.PENDING?.total ?? 0;
  const paidTotal = summary.PAID?.total ?? 0;

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
          {referrals.map((referral, idx) => {
            const marketer = referral.marketer;
            const sale = referral.sale;
            return (
              <DataTableRow key={referral.id} index={idx}>
                <DataTableCell className="font-medium">
                  {marketer ? (
                    <div>
                      <p className="font-semibold text-foreground text-sm">{getFullName(marketer)}</p>
                      <p className="text-xs text-muted-foreground">{marketer.email}</p>
                    </div>
                  ) : (
                    <span className="font-mono text-xs">{referral.marketerId}</span>
                  )}
                </DataTableCell>
                <DataTableCell>{sale?.propertyName ?? "Unknown property"}</DataTableCell>
                <DataTableCell align="right">{formatCurrency(sale?.totalAmount ?? 0)}</DataTableCell>
                <DataTableCell align="right" className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(referral.commissionAmount)}
                </DataTableCell>
                <DataTableCell align="center">
                  <StatusBadge status={referral.status} />
                </DataTableCell>
                <DataTableCell align="center">
                  <div className="flex justify-center items-center gap-1.5">
                    {referral.saleId && (
                      <Link href={`/management/sales/${referral.saleId}`}>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                          <Eye className="h-3.5 w-3.5" /> Sale Details
                        </Button>
                      </Link>
                    )}
                    {referral.status === "PENDING" ? (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleMarkPaid(referral)}
                        disabled={payingId === referral.id}
                      >
                        {payingId === referral.id ? "Saving…" : "Mark Paid"}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Paid {referral.paidAt ? formatDate(referral.paidAt) : ""}
                      </span>
                    )}
                  </div>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
