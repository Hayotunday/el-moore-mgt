"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
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
import { clockIn, clockOut, getTodayRecord, listAttendance } from "@/lib/api/attendance";
import type { AttendanceRecord } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function AttendancePage() {
  const { user } = useAuth();
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(new Date());

  const load = useCallback(async () => {
    if (!user) return;
    const [record, all] = await Promise.all([getTodayRecord(user.id), listAttendance(user.id)]);
    setToday(record);
    setHistory(all);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await clockIn(user.id, user.name);
      toast.success("Clocked in.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await clockOut(user.id);
      toast.success("Clocked out.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Attendance" subtitle="Clock in when you start, clock out when you're done." />

      <div className="rounded-md bg-card p-8 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.08)] flex flex-col items-center text-center gap-6">
        <Clock className="h-8 w-8 text-gold" />
        <div>
          <p className="text-5xl font-bold text-foreground tabular-nums">
            {now.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {today
              ? today.clockOut
                ? `Clocked in at ${today.clockIn} · clocked out at ${today.clockOut}`
                : `Clocked in at ${today.clockIn}`
              : "You haven't clocked in today."}
          </p>
        </div>
        {!today && (
          <Button size="lg" onClick={handleClockIn} disabled={busy}>
            <LogIn className="h-4 w-4" /> Clock In
          </Button>
        )}
        {today && !today.clockOut && (
          <Button size="lg" variant="destructive" onClick={handleClockOut} disabled={busy}>
            <LogOut className="h-4 w-4" /> Clock Out
          </Button>
        )}
        {today && today.clockOut && (
          <p className="text-sm font-medium text-emerald-700">
            You&apos;ve completed today&apos;s attendance. See you tomorrow.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Your Recent History</h2>
        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Date</DataTableHeadCell>
            <DataTableHeadCell>Clock In</DataTableHeadCell>
            <DataTableHeadCell>Clock Out</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {history.length === 0 && <DataTableEmpty colSpan={3} />}
            {history.map((record, idx) => (
              <DataTableRow key={record.id} index={idx}>
                <DataTableCell>{formatDate(record.date)}</DataTableCell>
                <DataTableCell>{record.clockIn}</DataTableCell>
                <DataTableCell>{record.clockOut ?? "—"}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
