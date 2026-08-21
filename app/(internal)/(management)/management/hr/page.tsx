"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Users, ClipboardCheck } from "lucide-react";
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
import { listUsers } from "@/lib/api/users";
import { listAttendance } from "@/lib/api/attendance";
import { listReports } from "@/lib/api/daily-reports";
import type { AttendanceRecord, DailyTaskReport, ManagementUser } from "@/lib/api/types";
import { ROLE_LABELS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

export default function HrPage() {
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState<DailyTaskReport[]>([]);

  const load = useCallback(async () => {
    const [u, a] = await Promise.all([listUsers(), listAttendance()]);
    setUsers(u);
    setAttendance(a);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      setReports(await listReports(selectedStaffId === "all" ? undefined : selectedStaffId));
    })();
  }, [selectedStaffId]);

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, search]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const presentToday = new Set(attendance.filter((a) => a.date === todayStr).map((a) => a.staffId)).size;

  return (
    <div className="space-y-8">
      <PageHeader title="HR" subtitle="Staff attendance stats and daily task report history." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Staff" value={users.length} icon={<Users className="h-6 w-6" />} />
        <StatCard
          label="Present Today"
          value={`${presentToday}/${users.length}`}
          icon={<Users className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Reports Logged"
          value={reports.length}
          sublabel={selectedStaffId === "all" ? "All staff" : "Selected staff"}
          icon={<ClipboardCheck className="h-6 w-6" />}
          variant="gold"
        />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name…"
        filters={[
          {
            key: "staff",
            label: "Staff",
            value: selectedStaffId,
            onChange: setSelectedStaffId,
            options: filteredStaff.map((u) => ({ label: u.name, value: u.id })),
          },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Staff Roster</h2>
        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Name</DataTableHeadCell>
            <DataTableHeadCell>Role</DataTableHeadCell>
            <DataTableHeadCell align="center">Today</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {filteredStaff.length === 0 && <DataTableEmpty colSpan={3} />}
            {filteredStaff.map((u, idx) => {
              const today = attendance.find((a) => a.staffId === u.id && a.date === todayStr);
              return (
                <DataTableRow key={u.id} index={idx}>
                  <DataTableCell className="font-medium">{u.name}</DataTableCell>
                  <DataTableCell>{ROLE_LABELS[u.role]}</DataTableCell>
                  <DataTableCell align="center">
                    {today ? (today.clockOut ? "Clocked out" : "Clocked in") : "Not clocked in"}
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTableBody>
        </DataTable>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {selectedStaffId === "all" ? "All Daily Task Reports" : "Daily Task Reports"}
        </h2>
        <div className="space-y-4">
          {reports.length === 0 && (
            <p className="text-sm text-muted-foreground">No reports for this selection.</p>
          )}
          {reports.map((report) => (
            <div key={report.id} className="rounded-md bg-card p-5 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{report.staffName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(report.date)}</p>
              </div>
              <p className="text-sm text-muted-foreground">{report.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
