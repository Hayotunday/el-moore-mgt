"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Building2, Pencil, Trash2 } from "lucide-react";
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
import PropertyFormDrawer from "@/components/management/property-form-drawer";
import {
  listProperties,
  deleteProperty,
  joinSaleToProperties,
  type PropertyWithSale,
} from "@/lib/api/properties";
import { listSales } from "@/lib/api/sales";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { blurActiveElement, formatCurrency, formatDate } from "@/lib/utils";

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyWithSale[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProperty, setEditingProperty] =
    useState<PropertyWithSale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const propertyList = await listProperties();
      const saleList = await listSales().catch(() => []);
      setProperties(joinSaleToProperties(propertyList, saleList));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load properties.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.location.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [properties, search, statusFilter]);

  const totalValue = properties.reduce((sum, p) => sum + Number(p.price), 0);
  const soldCount = properties.filter((p) => p.status === "SOLD").length;

  const openNew = () => {
    blurActiveElement();
    setEditingProperty(null);
    setDrawerOpen(true);
  };

  const openEdit = (property: PropertyWithSale) => {
    blurActiveElement();
    setEditingProperty(property);
    setDrawerOpen(true);
  };

  const handleDelete = async (property: PropertyWithSale) => {
    const ok = await confirm({
      title: `Delete "${property.title}"?`,
      description: "This removes the listing permanently and can't be undone.",
      confirmLabel: "Delete Property",
      destructive: true,
    });
    if (!ok) return;
    setDeletingId(property.id);
    try {
      await deleteProperty(property.id);
      toast.success("Property deleted.");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete property.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Property Documents"
        subtitle="Every listing, its current status, and who bought it when sold."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Properties"
          value={properties.length}
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          label="Sold"
          value={soldCount}
          variant="gold"
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          label="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          icon={<Building2 className="h-6 w-6" />}
        />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or location…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Available", value: "AVAILABLE" },
              { label: "Reserved", value: "RESERVED" },
              { label: "Sold", value: "SOLD" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Property</DataTableHeadCell>
          <DataTableHeadCell align="right">Price</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell>Buyer</DataTableHeadCell>
          <DataTableHeadCell align="right">Actions</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={5} />}
          {filtered.map((property, idx) => (
            <DataTableRow key={property.id} index={idx}>
              <DataTableCell>
                <Link
                  href={`/management/properties/${property.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2"
                >
                  {property.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {property.location}
                </p>
              </DataTableCell>
              <DataTableCell align="right">
                {formatCurrency(property.price)}
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={property.status} />
              </DataTableCell>
              <DataTableCell>
                {property.sale ? (
                  <div>
                    <p className="font-medium">{property.sale.buyerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {property.sale.saleType === "OUTRIGHT"
                        ? "Outright"
                        : "Installment"}{" "}
                      · {formatDate(property.sale.createdAt)}
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DataTableCell>
              <DataTableCell align="right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => openEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={deletingId === property.id}
                    onClick={() => handleDelete(property)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <PropertyFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editingProperty={editingProperty}
        onSaved={load}
      />
    </div>
  );
}
