"use client";

import { useState } from "react";
import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import {
  hrStaffList,
  attendanceLog,
  disciplinaryLog,
  taskRoster,
} from "@/lib/dashboardMockData";
import { Clock, AlertCircle, CheckCircle2, Edit, Trash2 } from "lucide-react";

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState<
    "attendance" | "discipline" | "tasks"
  >("attendance");
  const [clockInOpen, setClockInOpen] = useState(false);

  const onTimeCount = attendanceLog.filter(
    (log) => log.status === "On Time"
  ).length;
  const lateCount = attendanceLog.filter((log) => log.status === "Late").length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 font-semibold";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

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

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "attendance"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Attendance Log
          </button>
          <button
            onClick={() => setActiveTab("discipline")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "discipline"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Disciplinary Log
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "tasks"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Task Roster
          </button>
        </div>

        {/* Attendance Log */}
        {activeTab === "attendance" && (
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
        )}

        {/* Disciplinary Log */}
        {activeTab === "discipline" && (
          <div className="space-y-4">
            {disciplinaryLog.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-border bg-background p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {log.staffName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}
                      >
                        {log.severity}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.date} • {log.issue}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground border-t border-border pt-4">
                  {log.notes}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Task Roster */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {taskRoster.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-background p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {task.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} bg-opacity-10`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigned to: <span className="font-medium">{task.assignee}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {task.dueDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
