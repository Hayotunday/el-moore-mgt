"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import SearchFilterBar from "@/components/management/search-filter-bar";
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from "@/components/management/data-table";
import { listMyReferrals } from "@/lib/api/referrals";
import type { Referral } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MarketerReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReferrals(await listMyReferrals());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load your referrals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return referrals.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q) {
        const haystack = `${r.sale?.property?.title ?? ""} ${r.saleId}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [referrals, statusFilter, search]);

  const pendingTotal = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + Number(r.commissionAmount), 0);
  const paidTotal = referrals
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + Number(r.commissionAmount), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="El-Moore Marketer"
        title="Your Referrals"
        subtitle="Every sale attributed to you, and where its commission stands."
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

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by property…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Pending", value: "PENDING" },
              { label: "Paid", value: "PAID" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Property</DataTableHeadCell>
          <DataTableHeadCell align="right">Sale Amount</DataTableHeadCell>
          <DataTableHeadCell align="right">Commission</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="right">Date</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={5} />}
          {filtered.map((r, idx) => (
            <DataTableRow key={r.id} index={idx}>
              <DataTableCell className="font-medium">
                {r.sale?.property?.title ?? `Sale ${r.saleId}`}
              </DataTableCell>
              <DataTableCell align="right">
                {r.sale?.totalAmount ? formatCurrency(r.sale.totalAmount) : "—"}
              </DataTableCell>
              <DataTableCell align="right" className="font-semibold text-gold">
                {formatCurrency(r.commissionAmount)}
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={r.status} />
              </DataTableCell>
              <DataTableCell align="right">
                {r.status === "PAID" && r.paidAt ? formatDate(r.paidAt) : formatDate(r.createdAt)}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
