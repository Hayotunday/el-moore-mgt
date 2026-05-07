"use client";

import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import {
  marketerProfile,
  marketerSalesReport,
} from "@/lib/dashboardMockData";
import { TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import Link from "next/link";

export default function MarketerPortal() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalCommissions = marketerSalesReport.reduce(
    (sum, sale) => sum + sale.commission,
    0
  );

  return (
    <RoleGuard allowedRoles={["marketer"]}>
      <div className="space-y-8">
        {/* Header & Profile Card */}
        <div className="rounded-lg border border-border bg-muted/30 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-foreground">
                {marketerProfile.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                External Sales Agent
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{marketerProfile.email}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="font-medium">{marketerProfile.phone}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Member Since:</span>{" "}
                  <span className="font-medium">{marketerProfile.joinDate}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-background p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Active Listings
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {marketerProfile.totalListings}
                </p>
              </div>
              <div className="rounded-lg bg-background p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Completed Sales
                </p>
                <p className="text-3xl font-bold text-gold">
                  {marketerProfile.completedSales}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Commission Earned"
            value={formatCurrency(totalCommissions)}
            sublabel="From all sales"
            icon={<DollarSign className="h-6 w-6" />}
            variant="accent"
          />
          <StatCard
            label="Active Sales"
            value={marketerProfile.activeSales}
            sublabel="In progress"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            label="Total Leads"
            value={leads.length}
            sublabel="In database"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Quick Links to Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/marketer/sales"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <TrendingUp className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              My Sales Report
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              View your completed sales
            </p>
          </Link>

          <Link
            href="/marketer/history"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <DollarSign className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Commission History
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your earnings history
            </p>
          </Link>

          <Link
            href="/marketer/leads"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <FileText className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Lead Generation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and generate leads
            </p>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
