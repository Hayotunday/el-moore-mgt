"use client";

import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import { recentTransactions, commissionDisbursements } from "@/lib/dashboardMockData";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import Link from "next/link";

export default function FinanceDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalTransacted = recentTransactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );
  const totalDisbursed = commissionDisbursements.reduce(
    (sum, disb) => sum + disb.disbursed,
    0
  );
  const pendingPayments = commissionDisbursements.filter(
    (disb) => disb.status !== "Paid"
  ).length;

  return (
    <RoleGuard allowedRoles={["finance"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Finance & Payouts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage transactions and commission disbursements
          </p>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Transacted"
            value={formatCurrency(totalTransacted)}
            sublabel="This period"
            icon={<DollarSign className="h-6 w-6" />}
            variant="accent"
          />
          <StatCard
            label="Total Disbursed"
            value={formatCurrency(totalDisbursed)}
            sublabel="Commission payments"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            label="Pending Payments"
            value={pendingPayments}
            sublabel="Awaiting processing"
            icon={<Download className="h-6 w-6" />}
          />
        </div>

        {/* Quick Links to Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/finance/transactions"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <DollarSign className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Recent Transactions
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              View all financial transactions
            </p>
          </Link>

          <Link
            href="/finance/commissions"
            className="rounded-lg border border-border bg-muted/30 p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <CreditCard className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              Commission Payouts
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and disburse commissions
            </p>
          </Link>
        </div>
      </div>
    </RoleGuard>
  );
}
