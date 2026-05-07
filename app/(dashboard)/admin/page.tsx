"use client";

import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import { adminDashboardStats } from "@/lib/dashboardMockData";
import {
  DollarSign,
  Users,
  Home,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Admin Control Center
          </h1>
          <p className="text-muted-foreground mt-2">
            High-level overview of critical metrics and operations
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Inventory Value"
            value={formatCurrency(adminDashboardStats.totalInventoryValue)}
            sublabel="All active properties"
            icon={<DollarSign className="h-6 w-6" />}
            variant="accent"
          />
          <StatCard
            label="Active Marketers"
            value={adminDashboardStats.activeMarketerCount}
            sublabel="Sales professionals"
            icon={<Users className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            label="Total Properties"
            value={adminDashboardStats.totalProperties}
            sublabel="In portfolio"
            icon={<Home className="h-6 w-6" />}
          />
          <StatCard
            label="Sold This Month"
            value={adminDashboardStats.soldThisMonth}
            sublabel="Jan 2024"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Quick Links to Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <Users className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              User Management
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, roles, and access permissions
            </p>
          </Link>

          <Link
            href="/admin/inventory"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <Home className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Property Inventory
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage properties and listing status
            </p>
          </Link>

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <TrendingUp className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground">
              Analytics
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Performance metrics and reports
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
