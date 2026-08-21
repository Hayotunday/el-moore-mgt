"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, X } from "lucide-react";
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
import { listCustomers } from "@/lib/api/customers";
import type { Customer } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState("all");
  const [active, setActive] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setCustomers(
      await listCustomers({
        search: search || undefined,
        saleType: saleTypeFilter === "all" ? undefined : (saleTypeFilter as "OUTRIGHT" | "INSTALLMENT"),
      }),
    );
    setLoading(false);
  }, [search, saleTypeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Customers" subtitle="Every buyer on record, derived from their sales history." />

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
        filters={[
          {
            key: "saleType",
            label: "Sale Type",
            value: saleTypeFilter,
            onChange: setSaleTypeFilter,
            options: [
              { label: "Outright", value: "OUTRIGHT" },
              { label: "Installment", value: "INSTALLMENT" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Customer</DataTableHeadCell>
          <DataTableHeadCell>Contact</DataTableHeadCell>
          <DataTableHeadCell align="center">Properties</DataTableHeadCell>
          <DataTableHeadCell align="right">Total Spent</DataTableHeadCell>
          <DataTableHeadCell align="right">Last Purchase</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && customers.length === 0 && <DataTableEmpty colSpan={5} />}
          {customers.map((customer, idx) => (
            <DataTableRow
              key={customer.key}
              index={idx}
              className="cursor-pointer"
            >
              <DataTableCell>
                <button
                  onClick={() => setActive(customer)}
                  className="font-medium text-foreground hover:text-primary text-left"
                >
                  {customer.name}
                </button>
              </DataTableCell>
              <DataTableCell>
                <p>{customer.email}</p>
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              </DataTableCell>
              <DataTableCell align="center">{customer.saleCount}</DataTableCell>
              <DataTableCell align="right">{formatCurrency(customer.totalSpent)}</DataTableCell>
              <DataTableCell align="right">{formatDate(customer.lastPurchaseDate)}</DataTableCell>
            </DataTableRow>
          ))}
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
                <h3 className="text-lg font-semibold text-foreground">{active.name}</h3>
                <p className="text-sm text-muted-foreground">{active.email}</p>
                <p className="text-sm text-muted-foreground">{active.phone}</p>
              </div>
              <button onClick={() => setActive(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Properties Purchased
              </p>
              {active.properties.map((p) => (
                <p key={p} className="text-sm text-foreground bg-muted/40 rounded-sm px-3 py-2">
                  {p}
                </p>
              ))}
              <div className="flex justify-between pt-3 border-t border-border/60">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="text-sm font-semibold text-gold">
                  {formatCurrency(active.totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sale Types</span>
                <span className="text-sm text-foreground">{active.saleTypes.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
