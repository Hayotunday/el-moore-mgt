"use client";

import StatCard from "@/components/dashboard-stat-card";
import {
  marketerProfile,
  marketerSalesReport,
  leads,
} from "@/lib/dashboardMockData";
import { TrendingUp, DollarSign, Users, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    0,
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {marketerProfile.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your sales performance overview
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {marketerProfile.name}
              </h2>
              <p className="text-muted-foreground">External Sales Agent</p>
              <p className="text-sm text-muted-foreground">
                Member since {marketerProfile.joinDate}
              </p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Marketer Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information and contact details.
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center text-sm text-muted-foreground">
                Profile edit form implementation goes here.
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Commission"
          value={formatCurrency(totalCommissions)}
          sublabel="Lifetime earnings"
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
          label="Completed Sales"
          value={marketerProfile.completedSales}
          sublabel="This year"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          label="Total Leads"
          value={leads.length}
          sublabel="In database"
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/marketer/sales"
          className="group rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <TrendingUp className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            View Sales Report
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track your completed transactions and performance
          </p>
        </Link>

        <Link
          href="/marketer/history"
          className="group rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <DollarSign className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Commission History
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            View your earnings and payment history
          </p>
        </Link>

        <Link
          href="/marketer/leads"
          className="group rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Users className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Manage Leads
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and track potential clients
          </p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-muted/30 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm">💰</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Commission payment received</p>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(250000)}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New property listing added</p>
              <p className="text-xs text-muted-foreground">5 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm">👥</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Lead converted to sale</p>
              <p className="text-xs text-muted-foreground">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
