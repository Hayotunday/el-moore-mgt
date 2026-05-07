"use client";

import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import {
  hrStaffList,
  attendanceLog,
  disciplinaryLog,
  taskRoster,
} from "@/lib/dashboardMockData";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function HRDashboard() {
  const onTimeCount = attendanceLog.filter(
    (log) => log.status === "On Time"
  ).length;
  const lateCount = attendanceLog.filter((log) => log.status === "Late").length;
  const pendingDiscipline = disciplinaryLog.filter(
    (log) => log.status === "Pending"
  ).length;

  return (
    <RoleGuard allowedRoles={["hr_staff"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            HR & Staff Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage attendance, discipline, and staff tasks
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Staff Members"
            value={hrStaffList.length}
            sublabel="Active employees"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatCard
            label="On Time Today"
            value={onTimeCount}
            sublabel={`${lateCount} late arrivals`}
            icon={<CheckCircle2 className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            label="Pending Issues"
            value={
              disciplinaryLog.filter((log) => log.status === "Pending").length
            }
            sublabel="Requiring attention"
            icon={<AlertCircle className="h-6 w-6" />}
            variant="accent"
          />
        </div>

        {/* Digital Attendance Widget */}
        <div className="rounded-lg border border-border bg-muted/30 p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Digital Attendance
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Clock in/out for today&apos;s shift
              </p>
            </div>
            <button
              onClick={() => setClockInOpen(!clockInOpen)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {clockInOpen ? "Close" : "Clock In/Out"}
            </button>
          </div>

          {clockInOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
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
          )}
        </div>

        {/* Quick Links to Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/hr/attendance"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <Clock className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Attendance Log
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage staff clock records
            </p>
          </Link>

          <Link
            href="/hr/discipline"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <AlertCircle className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Disciplinary Log
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track and resolve staff issues
            </p>
          </Link>

          <Link
            href="/hr/tasks"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Task Roster
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Assign and track team tasks
            </p>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
