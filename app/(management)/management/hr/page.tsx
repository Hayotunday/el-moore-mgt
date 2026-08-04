"use client";

import { useState } from "react";
import StatCard from "@/components/dashboard-stat-card";
import {
  Users,
  CalendarDays,
  TrendingUp,
  Clock,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HRDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Attendance & Staff Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage daily attendance, disciplinary logs, and staff tasks.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 shadow-sm">
              <Clock className="h-4 w-4" />
              Clock In/Out
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Attendance Recording
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 border border-dashed border-border rounded-md text-center bg-muted/30">
              <p className="text-sm text-muted-foreground italic">
                Attendance form implementation is ready for integration.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Present Today"
          value="14"
          sublabel="Staff members active"
          icon={<Users className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Pending Tasks"
          value="8"
          sublabel="Assigned in roster"
          icon={<ClipboardList className="h-6 w-6" />}
        />
        <StatCard
          label="Disciplinary Logs"
          value="0"
          sublabel="Recorded this week"
          icon={<AlertCircle className="h-6 w-6" />}
          variant="accent"
        />
      </div>
    </div>
  );
}
