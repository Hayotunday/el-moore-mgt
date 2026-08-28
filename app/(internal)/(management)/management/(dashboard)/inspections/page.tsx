"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MapPinned, CheckCircle2, Clock } from "lucide-react";
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
import { listInspectionRequests, updateInspectionStatus } from "@/lib/api/inspections";
import { listCustomers } from "@/lib/api/customers";
import { listProperties } from "@/lib/api/properties";
import { listUsers } from "@/lib/api/users";
import type { Customer, InspectionRequest, ManagementUser, Property } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function InspectionsPage() {
  const [requests, setRequests] = useState<InspectionRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<ManagementUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c, p, u] = await Promise.all([
        listInspectionRequests(),
        listCustomers(),
        listProperties(),
        listUsers(),
      ]);
      setRequests(r);
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
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q) {
        const customerName = customerById.get(r.customerId)?.fullName.toLowerCase() ?? "";
        const propertyTitle = propertyById.get(r.propertyId)?.title.toLowerCase() ?? "";
        if (!customerName.includes(q) && !propertyTitle.includes(q)) return false;
      }
      return true;
    });
  }, [requests, search, statusFilter, customerById, propertyById]);

  const scheduledCount = requests.filter((r) => r.status === "SCHEDULED").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  const handleStatusChange = async (id: string, status: InspectionRequest["status"]) => {
    setBusyId(id);
    try {
      await updateInspectionStatus(id, status);
      toast.success(`Inspection marked as ${status.toLowerCase().replace("_", " ")}.`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Site Inspections"
        subtitle="Scheduled land and property inspections for prospective buyers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Inspections" value={requests.length} icon={<MapPinned className="h-6 w-6" />} />
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
          <DataTableHeadCell>Booked By</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="center">Action</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={6} />}
          {filtered.map((request, idx) => {
            const customer = customerById.get(request.customerId);
            const property = propertyById.get(request.propertyId);
            const bookedBy = staffById.get(request.scheduledById);
            return (
              <DataTableRow key={request.id} index={idx}>
                <DataTableCell>
                  <p className="font-medium">{customer?.fullName ?? "Unknown customer"}</p>
                  <p className="text-xs text-muted-foreground">{customer?.phone}</p>
                </DataTableCell>
                <DataTableCell>{property?.title ?? "Unknown property"}</DataTableCell>
                <DataTableCell>
                  {new Date(request.scheduledAt).toLocaleString("en-NG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </DataTableCell>
                <DataTableCell>{bookedBy?.name ?? "—"}</DataTableCell>
                <DataTableCell align="center">
                  <StatusBadge status={request.status} />
                </DataTableCell>
                <DataTableCell align="center">
                  {request.status === "SCHEDULED" ? (
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === request.id}
                        onClick={() => handleStatusChange(request.id, "COMPLETED")}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === request.id}
                        onClick={() => handleStatusChange(request.id, "NO_SHOW")}
                      >
                        No-Show
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === request.id}
                        onClick={() => handleStatusChange(request.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {request.followUpSent ? "Follow-up sent" : "—"}
                    </span>
                  )}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
