"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MapPinned, CheckCircle2, Clock, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { listInspections, scheduleInspection, updateInspection } from "@/lib/api/site-inspections";
import { listCustomers } from "@/lib/api/customers";
import { listProperties } from "@/lib/api/properties";
import { listUsers } from "@/lib/api/users";
import type { Customer, ManagementUser, Property, SiteInspection } from "@/lib/api/types";
import { blurActiveElement, getFullName } from "@/lib/utils";
import { useConfirm } from "@/contexts/confirm-dialog-context";

const EMPTY_FORM = { customerId: "", propertyId: "", scheduledAt: "", inspectorId: "", notes: "" };

export default function InspectionsPage() {
  const confirm = useConfirm();
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<ManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, c, p, u] = await Promise.all([
        listInspections(),
        listCustomers(),
        listProperties(),
        listUsers(),
      ]);
      setInspections(i);
      setCustomers(c);
      setProperties(p);
      setStaff(u);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load inspections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const propertyById = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const staffById = useMemo(() => new Map(staff.map((s) => [s.id, s])), [staff]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inspections.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (q) {
        const customerFound = i.customerId ? customerById.get(i.customerId) : undefined;
        const customerName = customerFound ? getFullName(customerFound).toLowerCase() : "";
        const propertyTitle = propertyById.get(i.propertyId)?.title.toLowerCase() ?? "";
        if (!customerName.includes(q) && !propertyTitle.includes(q)) return false;
      }
      return true;
    });
  }, [inspections, search, statusFilter, customerById, propertyById]);

  const scheduledCount = inspections.filter((i) => i.status === "SCHEDULED").length;
  const completedCount = inspections.filter((i) => i.status === "COMPLETED").length;

  const INSPECTION_CONFIRM: Record<
    SiteInspection["status"],
    { title: string; description: string; confirmLabel: string; destructive?: boolean }
  > = {
    COMPLETED: {
      title: "Mark as Completed?",
      description: "This will close the inspection and mark it as successfully completed.",
      confirmLabel: "Mark Complete",
    },
    NO_SHOW: {
      title: "Mark as No-Show?",
      description: "This will record that the customer did not attend the scheduled inspection.",
      confirmLabel: "Mark No-Show",
      destructive: true,
    },
    CANCELLED: {
      title: "Cancel Inspection?",
      description: "This will permanently cancel the inspection. A new one will need to be scheduled.",
      confirmLabel: "Cancel Inspection",
      destructive: true,
    },
    SCHEDULED: {
      title: "Reopen Inspection?",
      description: "This will set the inspection back to Scheduled.",
      confirmLabel: "Reopen",
    },
  };

  const handleStatusChange = async (id: string, status: SiteInspection["status"]) => {
    const opts = INSPECTION_CONFIRM[status];
    const ok = await confirm(opts);
    if (!ok) return;
    setBusyId(id);
    try {
      await updateInspection(id, { status });
      toast.success(`Inspection marked as ${status.toLowerCase().replace("_", " ")}.`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update inspection.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSchedule = async () => {
    if (!form.propertyId || !form.scheduledAt) {
      toast.error("Property and scheduled date/time are required.");
      return;
    }
    setSaving(true);
    try {
      await scheduleInspection({
        propertyId: form.propertyId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        customerId: form.customerId || undefined,
        inspectorId: form.inspectorId || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Inspection scheduled.");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not schedule inspection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Site Inspections"
        subtitle="Scheduled land and property inspections for prospective buyers."
        action={
          <Button
            onClick={() => {
              blurActiveElement();
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Schedule Inspection
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Inspections" value={inspections.length} icon={<MapPinned className="h-6 w-6" />} />
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          icon={<Clock className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="gold"
        />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer or property…"
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "Scheduled", value: "SCHEDULED" },
              { label: "Completed", value: "COMPLETED" },
              { label: "No-Show", value: "NO_SHOW" },
              { label: "Cancelled", value: "CANCELLED" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Customer</DataTableHeadCell>
          <DataTableHeadCell>Property</DataTableHeadCell>
          <DataTableHeadCell>Scheduled</DataTableHeadCell>
          <DataTableHeadCell>Inspector</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="center">Action</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={6} />}
          {filtered.map((inspection, idx) => {
            const customer = inspection.customerId ? customerById.get(inspection.customerId) : undefined;
            const property = propertyById.get(inspection.propertyId);
            const inspector = inspection.inspectorId ? staffById.get(inspection.inspectorId) : undefined;
            return (
              <DataTableRow key={inspection.id} index={idx}>
                <DataTableCell>
                  <p className="font-medium">{customer ? getFullName(customer) : "—"}</p>
                  <p className="text-xs text-muted-foreground">{customer?.phone}</p>
                </DataTableCell>
                <DataTableCell>{property?.title ?? "Unknown property"}</DataTableCell>
                <DataTableCell>
                  {new Date(inspection.scheduledAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </DataTableCell>
                <DataTableCell>{inspector ? getFullName(inspector) : "—"}</DataTableCell>
                <DataTableCell align="center">
                  <StatusBadge status={inspection.status} />
                </DataTableCell>
                <DataTableCell align="center">
                  {inspection.status === "SCHEDULED" ? (
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === inspection.id}
                        onClick={() => handleStatusChange(inspection.id, "COMPLETED")}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === inspection.id}
                        onClick={() => handleStatusChange(inspection.id, "NO_SHOW")}
                      >
                        No-Show
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === inspection.id}
                        onClick={() => handleStatusChange(inspection.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {inspection.followUpSent ? "Follow-up sent" : "—"}
                    </span>
                  )}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>

      <Drawer open={dialogOpen} onOpenChange={setDialogOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Schedule Inspection</DrawerTitle>
            <DrawerDescription>Book a land or property visit for a prospective buyer.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid gap-2">
              <Label>Property</Label>
              <Select value={form.propertyId} onValueChange={(v) => setForm((f) => ({ ...f, propertyId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property…" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Customer (optional)</Label>
              <Select
                value={form.customerId}
                onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer…" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {getFullName(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Inspector (optional)</Label>
                <Select
                  value={form.inspectorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, inspectorId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign staff…" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {getFullName(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Customer interested in duplex, preferred morning slot"
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={saving}>
              {saving ? "Scheduling…" : "Schedule Inspection"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
