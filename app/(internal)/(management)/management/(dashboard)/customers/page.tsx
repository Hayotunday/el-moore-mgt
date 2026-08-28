"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Users, X, Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { listCustomers, createCustomer } from "@/lib/api/customers";
import { listSales, type SaleWithDetails } from "@/lib/api/sales";
import type { Customer } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        listCustomers(search || undefined),
        listSales(),
      ]);
      setCustomers(c);
      setSales(s);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load customers.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const salesByCustomer = useMemo(() => {
    const map = new Map<string, SaleWithDetails[]>();
    for (const sale of sales) {
      if (!sale.customerId) continue;
      const list = map.get(sale.customerId) ?? [];
      list.push(sale);
      map.set(sale.customerId, list);
    }
    return map;
  }, [sales]);

  const totalSpend = customers.reduce(
    (sum, c) =>
      sum +
      (salesByCustomer.get(c.id) ?? []).reduce(
        (s, sale) => s + Number(sale.totalAmount),
        0,
      ),
    0,
  );

  const handleCreate = async () => {
    if (!form.fullName || !form.phone) {
      toast.error("Full name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      await createCustomer({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      toast.success("Customer added.");
      setDialogOpen(false);
      setForm({ fullName: "", phone: "", email: "", dateOfBirth: "" });
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not add customer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const activeSales = active ? (salesByCustomer.get(active.id) ?? []) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customers"
        subtitle="Buyer records and their purchase history."
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Customers"
          value={customers.length}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Total Lifetime Value"
          value={formatCurrency(totalSpend)}
          icon={<Users className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Avg. Spend"
          value={formatCurrency(
            customers.length ? totalSpend / customers.length : 0,
          )}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email or phone…"
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Customer</DataTableHeadCell>
          <DataTableHeadCell>Contact</DataTableHeadCell>
          <DataTableHeadCell align="center">Purchases</DataTableHeadCell>
          <DataTableHeadCell align="right">Total Spent</DataTableHeadCell>
          <DataTableHeadCell align="right">Customer Since</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && customers.length === 0 && <DataTableEmpty colSpan={5} />}
          {customers.map((customer, idx) => {
            const customerSales = salesByCustomer.get(customer.id) ?? [];
            const spent = customerSales.reduce(
              (s, sale) => s + Number(sale.totalAmount),
              0,
            );
            return (
              <DataTableRow
                key={customer.id}
                index={idx}
                className="cursor-pointer"
              >
                <DataTableCell>
                  <button
                    onClick={() => setActive(customer)}
                    className="font-medium text-foreground hover:text-primary text-left"
                  >
                    {customer.fullName}
                  </button>
                </DataTableCell>
                <DataTableCell>
                  <p>{customer.email ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.phone}
                  </p>
                </DataTableCell>
                <DataTableCell align="center">
                  {customerSales.length}
                </DataTableCell>
                <DataTableCell align="right">
                  {formatCurrency(spent)}
                </DataTableCell>
                <DataTableCell align="right">
                  {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-md rounded-md bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {active.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {active.email ?? "No email on file"}
                </p>
                <p className="text-sm text-muted-foreground">{active.phone}</p>
                {active.dateOfBirth && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Born {formatDate(active.dateOfBirth)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActive(null)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Purchase History
              </p>
              {activeSales.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No purchases on record yet.
                </p>
              )}
              {activeSales.map((sale) => (
                <div
                  key={sale.id}
                  className="text-sm text-foreground bg-muted/40 rounded-sm px-3 py-2 flex justify-between"
                >
                  <span>{sale.propertyTitle}</span>
                  <span className="text-gold font-medium">
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              ))}
              {activeSales.length > 0 && (
                <div className="flex justify-between pt-3 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">
                    Total Spent
                  </span>
                  <span className="text-sm font-semibold text-gold">
                    {formatCurrency(
                      activeSales.reduce(
                        (s, sale) => s + Number(sale.totalAmount),
                        0,
                      ),
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogDescription className="invisible">Customers</DialogDescription>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+2348012345678"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Date of Birth (optional)</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
