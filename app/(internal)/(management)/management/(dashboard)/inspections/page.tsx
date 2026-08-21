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
import { useAuth } from "@/contexts/auth-context";
import { listInspectionRequests, markInspectionDone } from "@/lib/api/inspections";
import type { InspectionRequest } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function InspectionsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<InspectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setRequests(await listInspectionRequests());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        q &&
        !r.customerName.toLowerCase().includes(q) &&
        !r.propertyTitle.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [requests, search, statusFilter]);

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const doneCount = requests.filter((r) => r.status === "DONE").length;

  const handleMarkDone = async (id: string) => {
    if (!user) return;
    setBusyId(id);
    try {
      await markInspectionDone(id, user.id);
      toast.success("Inspection marked as done.");
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
        subtitle="Land and property inspection requests submitted by customers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Requests" value={requests.length} icon={<MapPinned className="h-6 w-6" />} />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={<Clock className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          label="Completed"
          value={doneCount}
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
              { label: "Pending", value: "PENDING" },
              { label: "Done", value: "DONE" },
            ],
          },
        ]}
      />

      <DataTable>
        <DataTableHead>
          <DataTableHeadCell>Customer</DataTableHeadCell>
          <DataTableHeadCell>Property</DataTableHeadCell>
          <DataTableHeadCell>Preferred Date</DataTableHeadCell>
          <DataTableHeadCell align="center">Status</DataTableHeadCell>
          <DataTableHeadCell align="center">Action</DataTableHeadCell>
        </DataTableHead>
        <DataTableBody>
          {!loading && filtered.length === 0 && <DataTableEmpty colSpan={5} />}
          {filtered.map((request, idx) => (
            <DataTableRow key={request.id} index={idx}>
              <DataTableCell>
                <p className="font-medium">{request.customerName}</p>
                <p className="text-xs text-muted-foreground">{request.customerPhone}</p>
                <p className="text-xs text-muted-foreground">{request.customerEmail}</p>
              </DataTableCell>
              <DataTableCell>
                <p className="font-medium">{request.propertyTitle}</p>
                {request.note && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">{request.note}</p>
                )}
              </DataTableCell>
              <DataTableCell>
                <p>{formatDate(request.preferredDate)}</p>
                <p className="text-xs text-muted-foreground">
                  Requested {formatDate(request.requestedAt)}
                </p>
              </DataTableCell>
              <DataTableCell align="center">
                <StatusBadge status={request.status} />
              </DataTableCell>
              <DataTableCell align="center">
                {request.status === "PENDING" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkDone(request.id)}
                    disabled={busyId === request.id}
                  >
                    {busyId === request.id ? "Saving…" : "Mark as Done"}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Done {request.completedAt ? formatDate(request.completedAt) : ""}
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
