"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { listTransactions, createTransaction } from "@/lib/api/finance";
import type { FinancialTransaction, TransactionType } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "EXPENSE" as TransactionType, category: "", amount: "", note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setTransactions(
      await listTransactions({
        search: search || undefined,
        type: typeFilter === "all" ? undefined : (typeFilter as TransactionType),
      }),
    );
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const handleCreate = async () => {
    if (!form.category || !form.amount || !user) {
      toast.error("Category and amount are required.");
      return;
    }
    setSaving(true);
    try {
      await createTransaction({
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        date: new Date().toISOString().slice(0, 10),
        note: form.note || undefined,
        recordedById: user.id,
        recordedByName: user.name,
      });
      toast.success("Transaction recorded.");
      setDialogOpen(false);
      setForm({ type: "EXPENSE", category: "", amount: "", note: "" });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Office Finance"
        subtitle="Every income and expense entry, in one ledger."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Income" value={formatCurrency(totalIncome)} icon={<TrendingUp className="h-6 w-6" />} variant="success" />
        <StatCard label="Total Expenses" value={formatCurrency(totalExpense)} icon={<TrendingDown className="h-6 w-6" />} variant="destructive" />
        <StatCard label="Net Balance" value={formatCurrency(totalIncome - totalExpense)} icon={<DollarSign className="h-6 w-6" />} variant="gold" />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by category, note or recorded by…"
        filters={[
          {
            key: "type",
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: "Income", value: "INCOME" },
              { label: "Expense", value: "EXPENSE" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Date</DataTableHeadCell>
          <DataTableHeadCell>Category</DataTableHeadCell>
          <DataTableHeadCell align="center">Type</DataTableHeadCell>
          <DataTableHeadCell align="right">Amount</DataTableHeadCell>
          <DataTableHeadCell>Recorded By</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && transactions.length === 0 && <DataTableEmpty colSpan={5} />}
          {transactions.map((t, idx) => (
            <DataTableRow key={t.id} index={idx}>
              <DataTableCell>{formatDate(t.date)}</DataTableCell>
              <DataTableCell>
                <p className="font-medium">{t.category}</p>
                {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={t.type} />
              </DataTableCell>
              <DataTableCell align="right">
                <span className={t.type === "INCOME" ? "text-emerald-700 font-semibold" : "text-destructive font-semibold"}>
                  {t.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>
              </DataTableCell>
              <DataTableCell>{t.recordedByName}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as TransactionType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Office Utilities"
              />
            </div>
            <div className="grid gap-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="850000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Note (optional)</Label>
              <Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Add Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
