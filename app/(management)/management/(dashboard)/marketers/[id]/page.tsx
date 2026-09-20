"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Handshake,
  Mail,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  UserX,
  Building2,
  ArrowLeft,
  Loader2,
  Eye,
} from "lucide-react";
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
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { getUser, setMarketerStatus, deactivateUser } from "@/lib/api/users";
import { listReferrals, type ReferralWithSale } from "@/lib/api/referrals";
import type { ManagementUser, MarketerStatus } from "@/lib/api/types";
import { formatCurrency, formatDate, getFullName } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MarketerDetailPage({ params }: PageProps) {
  const { id: marketerId } = use(params);
  const router = useRouter();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [marketer, setMarketer] = useState<ManagementUser | null>(null);
  const [referrals, setReferrals] = useState<ReferralWithSale[]>([]);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, allReferrals] = await Promise.all([
        getUser(marketerId),
        listReferrals().catch(() => []),
      ]);

      setMarketer(userData);
      setReferrals(allReferrals.filter((r) => r.marketerId === marketerId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load marketer details.");
    } finally {
      setLoading(false);
    }
  }, [marketerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalReferralsCount = referrals.length;
  const totalSalesVolume = referrals.reduce((sum, r) => sum + Number(r.saleAmount || 0), 0);
  const totalCommission = referrals.reduce((sum, r) => sum + Number(r.commissionAmount || 0), 0);
  const pendingCommission = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + Number(r.commissionAmount || 0), 0);

  const handleUpdateStatus = async (status: MarketerStatus) => {
    if (!marketer) return;
    if (status === "REJECTED") {
      const ok = await confirm({
        title: "Reject Marketer Application?",
        description: `Are you sure you want to reject ${getFullName(marketer)}'s application? They will not be able to log in or earn commissions.`,
        confirmLabel: "Reject Application",
        destructive: true,
      });
      if (!ok) return;
    }

    setBusy(true);
    try {
      await setMarketerStatus(marketerId, status);
      toast.success(
        status === "APPROVED"
          ? `${getFullName(marketer)} has been approved!`
          : `${getFullName(marketer)} application was rejected.`,
      );
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async () => {
    if (!marketer) return;
    const ok = await confirm({
      title: `Deactivate ${getFullName(marketer)}?`,
      description: "This marketer will be deactivated and immediately prevented from accessing their portal. Their past referral history remains intact.",
      confirmLabel: "Deactivate",
      destructive: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      await deactivateUser(marketerId);
      toast.success("Marketer deactivated.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not deactivate marketer.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!marketer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Marketer Not Found" subtitle="The requested affiliate marketer could not be loaded." />
        <Link href="/management/marketers">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Marketers Network
          </Button>
        </Link>
      </div>
    );
  }

  const status = marketer.marketerStatus || "PENDING";

  return (
    <div className="space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/management/marketers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Affiliate Marketers
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{getFullName(marketer)}</h1>
            <StatusBadge status={status} />
            {!marketer.isActive && (
              <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                Deactivated
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {marketer.email} • Joined {formatDate(marketer.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {status === "PENDING" && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 gap-1"
                disabled={busy}
                onClick={() => handleUpdateStatus("REJECTED")}
              >
                <XCircle className="h-4 w-4" /> Reject Application
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                disabled={busy}
                onClick={() => handleUpdateStatus("APPROVED")}
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Marketer
              </Button>
            </>
          )}

          {status === "REJECTED" && (
            <Button
              variant="outline"
              className="text-emerald-600 hover:bg-emerald-500/10 gap-1"
              disabled={busy}
              onClick={() => handleUpdateStatus("APPROVED")}
            >
              <CheckCircle2 className="h-4 w-4" /> Re-Approve Partner
            </Button>
          )}

          {marketer.isActive && status === "APPROVED" && (
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 gap-1.5"
              disabled={busy}
              onClick={handleDeactivate}
            >
              <UserX className="h-4 w-4" /> Deactivate Account
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Attributed Sales"
          value={totalReferralsCount}
          sublabel="Closed deals"
          icon={<Handshake className="h-6 w-6" />}
        />
        <StatCard
          label="Sales Volume Generated"
          value={formatCurrency(totalSalesVolume)}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          label="Total Commissions Earned"
          value={formatCurrency(totalCommission)}
          icon={<DollarSign className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Pending Payouts"
          value={formatCurrency(pendingCommission)}
          sublabel={pendingCommission > 0 ? "Awaiting disbursement" : "All payouts settled"}
          icon={<DollarSign className="h-6 w-6" />}
          variant={pendingCommission > 0 ? "destructive" : "success"}
        />
      </div>

      {/* Attributed Referrals & Property Sales */}
      <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            Attributed Property Sales & Commissions ({referrals.length})
          </h2>
        </div>

        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Property Title</DataTableHeadCell>
            <DataTableHeadCell>Buyer Name</DataTableHeadCell>
            <DataTableHeadCell align="right">Sale Amount</DataTableHeadCell>
            <DataTableHeadCell align="right">Commission Earned</DataTableHeadCell>
            <DataTableHeadCell align="center">Payout Status</DataTableHeadCell>
            <DataTableHeadCell align="right">Date</DataTableHeadCell>
            <DataTableHeadCell align="right">Actions</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {referrals.length === 0 ? (
              <DataTableEmpty colSpan={7} />
            ) : (
              referrals.map((ref, idx) => (
                <DataTableRow key={ref.id} index={idx}>
                  <DataTableCell className="font-semibold text-foreground">
                    {ref.sale?.property?.title || "Property Sale"}
                  </DataTableCell>
                  <DataTableCell className="text-muted-foreground">
                    {ref.buyerName || "—"}
                  </DataTableCell>
                  <DataTableCell align="right" className="font-medium text-foreground">
                    {formatCurrency(ref.saleAmount)}
                  </DataTableCell>
                  <DataTableCell align="right" className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(Number(ref.commissionAmount))}
                  </DataTableCell>
                  <DataTableCell align="center">
                    <StatusBadge status={ref.status} />
                  </DataTableCell>
                  <DataTableCell align="right" className="text-xs text-muted-foreground">
                    {formatDate(ref.createdAt)}
                  </DataTableCell>
                  <DataTableCell align="right">
                    <Link href={`/management/sales/${ref.saleId}`}>
                      <Button size="sm" variant="outline" className="gap-1 h-8">
                        <Eye className="h-3.5 w-3.5" /> Sale Details
                      </Button>
                    </Link>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
