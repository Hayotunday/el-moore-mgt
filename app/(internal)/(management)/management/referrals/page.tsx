"use client";

import { useEffect, useState, useCallback } from "react";
import { Share2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listUnreferredSales, type SaleWithDetails } from "@/lib/api/sales";
import { listReferrals, tagReferrer, markReferralPaid, type ReferralWithSale } from "@/lib/api/referrals";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [unreferredSales, setUnreferredSales] = useState<SaleWithDetails[]>([]);
  const [referrals, setReferrals] = useState<ReferralWithSale[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ saleId: "", marketerId: "", marketerName: "", commissionAmount: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [sales, refs] = await Promise.all([listUnreferredSales(), listReferrals()]);
    setUnreferredSales(sales);
    setReferrals(refs);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTag = async () => {
    if (!form.saleId || !form.marketerId || !form.marketerName || !form.commissionAmount) {
      toast.error("Fill in the sale, referrer ID, name and commission amount.");
      return;
    }
    setSaving(true);
    try {
      await tagReferrer({
        saleId: form.saleId,
        marketerId: form.marketerId,
        marketerName: form.marketerName,
        commissionAmount: Number(form.commissionAmount),
      });
      toast.success("Referrer tagged to sale.");
      setForm({ saleId: "", marketerId: "", marketerName: "", commissionAmount: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not tag referrer.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markReferralPaid(id);
      toast.success("Commission marked as paid.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update referral.");
    }
  };

  const pendingTotal = referrals
    .filter((r) => r.status === "PENDING")
    .reduce((sum, r) => sum + r.commissionAmount, 0);
  const paidTotal = referrals
    .filter((r) => r.status === "PAID")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Referrals & Commissions"
        subtitle="Attribute a sold property to the marketer who referred it, and track commission payouts."
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

      <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tag a Referrer</h2>
          <p className="text-sm text-muted-foreground">
            Attach a marketer&apos;s referrer ID to a sold property that has no marketer yet.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-2 md:col-span-2">
            <Label>Sold Property</Label>
            <Select value={form.saleId} onValueChange={(v) => setForm((f) => ({ ...f, saleId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a sale…" />
              </SelectTrigger>
              <SelectContent>
                {unreferredSales.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No un-referred sales available
                  </div>
                )}
                {unreferredSales.map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {sale.propertyTitle} — {sale.buyerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Referrer ID</Label>
            <Input
              value={form.marketerId}
              onChange={(e) => setForm((f) => ({ ...f, marketerId: e.target.value }))}
              placeholder="MKT-014"
            />
          </div>
          <div className="grid gap-2">
            <Label>Referrer Name</Label>
            <Input
              value={form.marketerName}
              onChange={(e) => setForm((f) => ({ ...f, marketerName: e.target.value }))}
              placeholder="Amara Okonkwo"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="grid gap-2 md:col-span-1">
            <Label>Commission (₦)</Label>
            <Input
              type="number"
              value={form.commissionAmount}
              onChange={(e) => setForm((f) => ({ ...f, commissionAmount: e.target.value }))}
              placeholder="4500000"
            />
          </div>
          <Button onClick={handleTag} disabled={saving} className="md:col-start-4">
            {saving ? "Tagging…" : "Tag Referrer"}
          </Button>
        </div>
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
              <DataTableCell>
                <p className="font-medium">{referral.marketerName}</p>
                <p className="text-xs text-muted-foreground">{referral.marketerId}</p>
              </DataTableCell>
              <DataTableCell>{referral.buyerName}</DataTableCell>
              <DataTableCell align="right">{formatCurrency(referral.saleAmount)}</DataTableCell>
              <DataTableCell align="right">{formatCurrency(referral.commissionAmount)}</DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={referral.status} />
              </DataTableCell>
              <DataTableCell align="center">
                {referral.status === "PENDING" ? (
                  <Button size="sm" variant="outline" onClick={() => handleMarkPaid(referral.id)}>
                    Mark as Paid
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
