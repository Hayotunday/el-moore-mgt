"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Building2 } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  listProperties,
  createProperty,
  joinSaleToProperties,
  type PropertyWithSale,
} from "@/lib/api/properties";
import { listSales } from "@/lib/api/sales";
import type { PropertyStatus } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyWithSale[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    status: "AVAILABLE" as PropertyStatus,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [propertyList, saleList] = await Promise.all([
        listProperties(),
        listSales(),
      ]);
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

  const handleCreate = async () => {
    if (!form.title || !form.location || !form.price) {
      toast.error("Title, location and price are required.");
      return;
    }
    setSaving(true);
    try {
      await createProperty({
        title: form.title,
        location: form.location,
        price: form.price,
        status: form.status,
      });
      toast.success("Property added to inventory.");
      setDialogOpen(false);
      setForm({ title: "", location: "", price: "", status: "AVAILABLE" });
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not add property.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Property Documents"
        subtitle="Every listing, its current status, and who bought it when sold."
        action={
          <Button onClick={() => setDialogOpen(true)}>
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
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={4} />}
          {filtered.map((property, idx) => (
            <DataTableRow key={property.id} index={idx}>
              <DataTableCell>
                <p className="font-medium">{property.title}</p>
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
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogDescription className="invisible">Properties</DialogDescription>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="4-Bed Terrace Duplex, Gwarinpa"
              />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Abuja - Gwarinpa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as PropertyStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="SOLD">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Price (₦)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="220000000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Saving…" : "Add Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
