"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Users, X, Plus, Pencil, Trash2 } from "lucide-react";
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
import {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerSales,
} from "@/lib/api/customers";
import { listProperties } from "@/lib/api/properties";
import type { Customer, Property, Sale } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const EMPTY_FORM = { fullName: "", phone: "", email: "", dateOfBirth: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesByCustomer, setSalesByCustomer] = useState<Map<string, Sale[]>>(new Map());
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, propertyList] = await Promise.all([listCustomers(search || undefined), listProperties()]);
      setCustomers(c);
      setProperties(propertyList);

      // GET /customers/{id}/sales, not the admin-only GET /sales — this page is also
      // open to CUSTOMER_CARE, which can't call the bulk sales list.
      const entries = await Promise.all(
        c.map(async (customer) => {
          try {
            return [customer.id, await getCustomerSales(customer.id)] as const;
          } catch {
            return [customer.id, [] as Sale[]] as const;
          }
        }),
      );
      setSalesByCustomer(new Map(entries));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const totalSpend = customers.reduce(
    (sum, c) => sum + (salesByCustomer.get(c.id) ?? []).reduce((s, sale) => s + Number(sale.totalAmount), 0),
    0,
  );

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setForm({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? "",
      dateOfBirth: customer.dateOfBirth ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone) {
      toast.error("Full name and phone are required.");
      return;
    }
    setSaving(true);
    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
    };
    try {
      if (editingId) {
        await updateCustomer(editingId, payload);
        toast.success("Customer updated.");
      } else {
        await createCustomer(payload);
        toast.success("Customer added.");
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete ${customer.fullName}? This can't be undone.`)) return;
    setDeletingId(customer.id);
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted.");
      if (active?.id === customer.id) setActive(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeSales = active ? salesByCustomer.get(active.id) ?? [] : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customers"
        subtitle="Buyer records and their purchase history."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Customers" value={customers.length} icon={<Users className="h-6 w-6" />} />
        <StatCard
          label="Total Lifetime Value"
          value={formatCurrency(totalSpend)}
          icon={<Users className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Avg. Spend"
          value={formatCurrency(customers.length ? totalSpend / customers.length : 0)}
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
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && customers.length === 0 && <DataTableEmpty colSpan={6} />}
          {customers.map((customer, idx) => {
            const customerSales = salesByCustomer.get(customer.id) ?? [];
            const spent = customerSales.reduce((s, sale) => s + Number(sale.totalAmount), 0);
            return (
              <DataTableRow key={customer.id} index={idx} className="cursor-pointer">
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
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                </DataTableCell>
                <DataTableCell align="center">{customerSales.length}</DataTableCell>
                <DataTableCell align="right">{formatCurrency(spent)}</DataTableCell>
                <DataTableCell align="right">
                  {customer.createdAt ? formatDate(customer.createdAt) : "—"}
                </DataTableCell>
                <DataTableCell align="right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => openEdit(customer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={deletingId === customer.id}
                      onClick={() => handleDelete(customer)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
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
          <div className="w-full max-w-md rounded-md bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{active.fullName}</h3>
                <p className="text-sm text-muted-foreground">{active.email ?? "No email on file"}</p>
                <p className="text-sm text-muted-foreground">{active.phone}</p>
                {active.dateOfBirth && (
                  <p className="text-xs text-muted-foreground mt-1">Born {formatDate(active.dateOfBirth)}</p>
                )}
              </div>
              <button onClick={() => setActive(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Purchase History
              </p>
              {activeSales.length === 0 && (
                <p className="text-sm text-muted-foreground">No purchases on record yet.</p>
              )}
              {activeSales.map((sale) => (
                <div key={sale.id} className="text-sm text-foreground bg-muted/40 rounded-sm px-3 py-2 flex justify-between">
                  <span>{propertyById.get(sale.propertyId)?.title ?? "Unknown property"}</span>
                  <span className="text-gold font-medium">{formatCurrency(sale.totalAmount)}</span>
                </div>
              ))}
              {activeSales.length > 0 && (
                <div className="flex justify-between pt-3 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                  <span className="text-sm font-semibold text-gold">
                    {formatCurrency(activeSales.reduce((s, sale) => s + Number(sale.totalAmount), 0))}
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
            <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+2348012345678"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date of Birth (optional)</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
