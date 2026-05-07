"use client";

import { useState } from "react";
import RoleGuard from "@/components/role-guard";
import { attendanceLog } from "@/lib/dashboardMockData";
import { Clock } from "lucide-react";

export default function AttendancePage() {
  const [clockInOpen, setClockInOpen] = useState(false);

  const onTimeCount = attendanceLog.filter(
    (log) => log.status === "On Time"
  ).length;
  const lateCount = attendanceLog.filter((log) => log.status === "Late").length;

  return (
    <RoleGuard allowedRoles={["hr_staff"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Digital Attendance
            </h1>
            <p className="text-muted-foreground mt-2">
              Clock in/out and view attendance records
            </p>
          </div>
          <button
            onClick={() => setClockInOpen(!clockInOpen)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {clockInOpen ? "Close" : "Clock In/Out"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              On Time Today
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">{onTimeCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Late Arrivals
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">{lateCount}</p>
          </div>
        </div>

        {/* Clock In/Out Widget */}
        {clockInOpen && (
          <div className="rounded-lg border border-border bg-muted/30 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg bg-background p-6 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase">
                  Clock In
                </p>
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">
                    {new Date().toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Confirm Clock In
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-background p-6 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase">
                  Clock Out
                </p>
                <div className="text-center">
                  <p className="text-5xl font-bold text-foreground">
                    {new Date().toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button className="mt-6 w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Confirm Clock Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Log Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceLog.map((log, idx) => (
                  <tr
                    key={log.id}
                    className={`border-b border-border transition-colors hover:bg-muted/30 ${
                      idx % 2 === 0 ? "bg-background" : "bg-surface"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {log.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {log.clockIn}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {log.clockOut}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === "On Time"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
