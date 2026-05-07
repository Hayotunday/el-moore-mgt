"use client";

import RoleGuard from "@/components/role-guard";
import { disciplinaryLog } from "@/lib/dashboardMockData";
import { Edit, Trash2, AlertCircle } from "lucide-react";

function getSeverityColor(severity: string) {
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
}

function getStatusColor(status: string) {
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
}

export default function DisciplinaryLogPage() {
  const pendingIssues = disciplinaryLog.filter(
    (log) => log.status === "Pending"
  ).length;

  return (
    <RoleGuard allowedRoles={["hr_staff"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Disciplinary Log
            </h1>
            <p className="text-muted-foreground mt-2">
              Track and manage staff disciplinary issues
            </p>
          </div>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Add Issue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total Issues
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {disciplinaryLog.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Pending
            </p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {pendingIssues}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Resolved
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {disciplinaryLog.filter((log) => log.status === "Resolved").length}
            </p>
          </div>
        </div>

        {/* Disciplinary Log Cards */}
        <div className="space-y-4">
          {disciplinaryLog.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-border bg-background p-6 space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {log.staffName}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}
                    >
                      {log.severity} Severity
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Issue:</span> {log.issue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Date:</span> {log.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Edit issue"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Delete issue"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium block mb-1">Notes:</span>
                  {log.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
