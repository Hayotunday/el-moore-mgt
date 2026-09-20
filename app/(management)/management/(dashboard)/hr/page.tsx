"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Users,
  Clock,
  ClipboardCheck,
  Calendar,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { listUsers } from "@/lib/api/users";
import { getAllAttendance } from "@/lib/api/attendance";
import { getAllReports } from "@/lib/api/daily-reports";
import type { AttendanceRecord, DailyTaskReport, ManagementUser } from "@/lib/api/types";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate, getFullName } from "@/lib/utils";

type DatePreset = "all" | "today" | "this_week" | "this_month" | "custom";

function formatTimeString(isoString?: string | null): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function calculateDuration(clockIn: string, clockOut?: string | null): string {
  if (!clockOut) return "In Progress";
  const start = new Date(clockIn).getTime();
  const end = new Date(clockOut).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "—";
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${mins} mins`;
  return `${hours} hrs ${mins} mins`;
}

export default function HrPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [allReports, setAllReports] = useState<DailyTaskReport[]>([]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"attendance" | "reports" | "roster">("attendance");

  // Common Filters
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReportForModal, setSelectedReportForModal] =
    useState<DailyTaskReport | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, r] = await Promise.all([
        listUsers(),
        getAllAttendance().catch(() => []),
        getAllReports().catch(() => []),
      ]);
      setUsers(u);
      setAttendance(a);
      setAllReports(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load HR data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute staff maps
  const staffById = useMemo(() => {
    const map = new Map<string, ManagementUser>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Date Filter logic
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (datePreset === "today") {
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === "this_week") {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
      return {
        start: startOfWeek.toISOString().slice(0, 10),
        end: todayStr,
      };
    }
    if (datePreset === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth.toISOString().slice(0, 10),
        end: todayStr,
      };
    }
    if (datePreset === "custom") {
      return { start: startDate || undefined, end: endDate || undefined };
    }
    return { start: undefined, end: undefined };
  }, [datePreset, startDate, endDate]);

  // Filtered Attendance Records
  const filteredAttendance = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attendance.filter((rec) => {
      // Staff filter
      if (selectedStaffId !== "all" && rec.staffId !== selectedStaffId) {
        return false;
      }
      // Staff name / text search
      if (q) {
        const staff = staffById.get(rec.staffId);
        const nameMatch = staff ? getFullName(staff).toLowerCase().includes(q) : false;
        const namePropMatch = rec.staffName ? rec.staffName.toLowerCase().includes(q) : false;
        if (!nameMatch && !namePropMatch) return false;
      }
      // Date filter
      if (dateRange.start && rec.date < dateRange.start) return false;
      if (dateRange.end && rec.date > dateRange.end) return false;

      return true;
    });
  }, [attendance, selectedStaffId, search, dateRange, staffById]);

  // Filtered Daily Reports
  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allReports.filter((report) => {
      // Staff filter
      if (selectedStaffId !== "all" && report.staffId !== selectedStaffId) {
        return false;
      }
      // Text search in staff name or report content
      if (q) {
        const staff = staffById.get(report.staffId);
        const nameMatch = staff ? getFullName(staff).toLowerCase().includes(q) : false;
        const namePropMatch = report.staffName ? report.staffName.toLowerCase().includes(q) : false;
        const contentMatch = report.content ? report.content.toLowerCase().includes(q) : false;
        if (!nameMatch && !namePropMatch && !contentMatch) return false;
      }
      // Date filter
      if (dateRange.start && report.date < dateRange.start) return false;
      if (dateRange.end && report.date > dateRange.end) return false;

      return true;
    });
  }, [allReports, selectedStaffId, search, dateRange, staffById]);

  // Filtered Staff Roster
  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (selectedStaffId !== "all" && u.id !== selectedStaffId) return false;
      if (q && !getFullName(u).toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [users, selectedStaffId, search]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const presentTodayCount = new Set(
    attendance.filter((a) => a.date === todayStr).map((a) => a.staffId),
  ).size;

  return (
    <div className="space-y-8">
      <PageHeader
        title="HR Workspace"
        subtitle="Comprehensive staff roster, clock-in history logs, and daily task report archives."
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Staff"
          value={loading ? "…" : users.length}
          sublabel="Active team roster"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Present Today"
          value={loading ? "…" : `${presentTodayCount}/${users.length}`}
          sublabel="Clocked in today"
          icon={<Clock className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Attendance Records"
          value={loading ? "…" : filteredAttendance.length}
          sublabel={datePreset === "all" ? "All-time history" : "Filtered in range"}
          icon={<Calendar className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Daily Reports Logged"
          value={loading ? "…" : filteredReports.length}
          sublabel={selectedStaffId === "all" ? "Across all staff" : "Selected staff member"}
          icon={<ClipboardCheck className="h-6 w-6" />}
        />
      </div>

      {/* Tabs & Global Filter Bar */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "attendance" | "reports" | "roster")}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4">
          <TabsList>
            <TabsTrigger value="attendance" className="gap-2">
              <Clock className="h-4 w-4" /> Attendance History ({filteredAttendance.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" /> Task Reports ({filteredReports.length})
            </TabsTrigger>
            <TabsTrigger value="roster" className="gap-2">
              <Users className="h-4 w-4" /> Staff Roster ({filteredStaff.length})
            </TabsTrigger>
          </TabsList>

          {/* Controls & Date Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Staff Filter Dropdown */}
            <div className="w-48">
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Staff Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff Members</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {getFullName(u)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Preset Selector */}
            {activeTab !== "roster" && (
              <div className="w-36">
                <Select
                  value={datePreset}
                  onValueChange={(val) => setDatePreset(val as DatePreset)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Date Pickers */}
            {activeTab !== "roster" && datePreset === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="w-36 text-xs"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="w-36 text-xs"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            {/* Search Input */}
            <div className="w-full sm:w-64">
              <SearchFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder={
                  activeTab === "reports" ? "Search staff or report text…" : "Search staff name…"
                }
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Attendance History */}
        <TabsContent value="attendance" className="m-0 space-y-4">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Date</DataTableHeadCell>
              <DataTableHeadCell>Staff Member</DataTableHeadCell>
              <DataTableHeadCell>Clock-In Time</DataTableHeadCell>
              <DataTableHeadCell>Clock-Out Time</DataTableHeadCell>
              <DataTableHeadCell align="center">Duration</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableRow index={0}>
                  <DataTableCell align="center" className="py-8 text-muted-foreground">
                    Loading attendance records…
                  </DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                </DataTableRow>
              ) : filteredAttendance.length === 0 ? (
                <DataTableEmpty colSpan={6} />
              ) : (
                filteredAttendance.map((rec, idx) => {
                  const staff = staffById.get(rec.staffId);
                  const staffName = staff ? getFullName(staff) : rec.staffName || "Staff Member";
                  const duration = calculateDuration(rec.clockIn, rec.clockOut);
                  const isClockedInOnly = !rec.clockOut;

                  return (
                    <DataTableRow key={rec.id} index={idx}>
                      <DataTableCell className="font-semibold text-foreground">
                        {formatDate(rec.date)}
                      </DataTableCell>

                      <DataTableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {staffName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{staffName}</p>
                            <p className="text-xs text-muted-foreground">{staff?.email || "—"}</p>
                          </div>
                        </div>
                      </DataTableCell>

                      <DataTableCell className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {formatTimeString(rec.clockIn)}
                      </DataTableCell>

                      <DataTableCell className="text-sm font-medium text-foreground">
                        {formatTimeString(rec.clockOut)}
                      </DataTableCell>

                      <DataTableCell align="center" className="text-xs text-muted-foreground font-mono">
                        {duration}
                      </DataTableCell>

                      <DataTableCell align="center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isClockedInOnly
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isClockedInOnly ? "Clocked In" : "Clocked Out"}
                        </span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>
        </TabsContent>

        {/* Tab 2: Daily Task Reports History */}
        <TabsContent value="reports" className="m-0 space-y-4">
          {loading ? (
            <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
              Loading daily task reports archive…
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No task reports match the selected staff or date filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const staff = staffById.get(report.staffId);
                const staffName = staff ? getFullName(staff) : report.staffName || "Staff Member";
                const isLong = report.content.length > 180 || report.content.includes("\n");

                return (
                  <div
                    key={report.id}
                    className="rounded-lg border bg-card p-5 space-y-3 shadow-ambient hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold font-bold text-xs shrink-0">
                          {staffName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-tight">
                            {staffName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Role: {staff ? ROLE_LABELS[staff.role] : "Staff"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md">
                          Report Date: {formatDate(report.date)}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Submitted at {formatTimeString(report.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-foreground leading-relaxed pl-1">
                      <p className={isLong ? "line-clamp-3" : "whitespace-pre-wrap"}>
                        {report.content}
                      </p>
                      {isLong && (
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 h-auto text-primary font-semibold text-xs mt-1.5 hover:underline"
                          onClick={() => setSelectedReportForModal(report)}
                        >
                          Read Full Report →
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Staff Roster */}
        <TabsContent value="roster" className="m-0 space-y-4">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Staff Member</DataTableHeadCell>
              <DataTableHeadCell>Role</DataTableHeadCell>
              <DataTableHeadCell>Email</DataTableHeadCell>
              <DataTableHeadCell align="center">Today&apos;s Status</DataTableHeadCell>
              <DataTableHeadCell align="right">Account Status</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {filteredStaff.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                filteredStaff.map((u, idx) => {
                  const todayRecord = attendance.find(
                    (a) => a.staffId === u.id && a.date === todayStr,
                  );

                  return (
                    <DataTableRow key={u.id} index={idx}>
                      <DataTableCell className="font-semibold text-foreground">
                        {getFullName(u)}
                      </DataTableCell>
                      <DataTableCell className="text-xs font-medium text-muted-foreground">
                        {ROLE_LABELS[u.role]}
                      </DataTableCell>
                      <DataTableCell className="text-xs text-muted-foreground">
                        {u.email}
                      </DataTableCell>
                      <DataTableCell align="center">
                        {todayRecord ? (
                          todayRecord.clockOut ? (
                            <StatusBadge status="COMPLETED" />
                          ) : (
                            <StatusBadge status="ACTIVE" />
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not Clocked In</span>
                        )}
                      </DataTableCell>
                      <DataTableCell align="right">
                        <StatusBadge status={u.isActive === false ? "INACTIVE" : "ACTIVE"} />
                      </DataTableCell>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!selectedReportForModal}
        onOpenChange={(open) => !open && setSelectedReportForModal(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedReportForModal
                ? staffById.get(selectedReportForModal.staffId)
                  ? getFullName(staffById.get(selectedReportForModal.staffId)!)
                  : selectedReportForModal.staffName || "Daily Task Report"
                : "Daily Task Report"}
            </DialogTitle>
            <DialogDescription>
              {selectedReportForModal
                ? `Submitted on ${formatDate(selectedReportForModal.date)} at ${formatTimeString(selectedReportForModal.createdAt)}`
                : "Task report details"}
            </DialogDescription>
          </DialogHeader>

          {selectedReportForModal && (
            <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-sans">
              {selectedReportForModal.content}
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
