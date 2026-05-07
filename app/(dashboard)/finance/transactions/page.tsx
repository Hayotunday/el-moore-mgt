"use client";

import RoleGuard from "@/components/role-guard";
import { recentTransactions } from "@/lib/dashboardMockData";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionsPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalIncome = recentTransactions
    .filter((txn) => txn.amount > 0)
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = recentTransactions
    .filter((txn) => txn.amount < 0)
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  const completedTransactions = recentTransactions.filter(
    (txn) => txn.status === "Completed"
  ).length;

  return (
    <RoleGuard allowedRoles={["finance"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Recent Transactions
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage financial transactions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Net Balance
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(totalIncome - totalExpenses)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Transaction Status Summary */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">
            Transaction Status
          </p>
          <div className="text-sm text-foreground">
            <p>Completed: <span className="font-semibold text-green-600">{completedTransactions}</span></p>
            <p>Pending: <span className="font-semibold text-yellow-600">{recentTransactions.filter((txn) => txn.status === "Pending").length}</span></p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Agent / Party
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn, idx) => (
                  <tr
                    key={txn.id}
                    className={`border-b border-border transition-colors hover:bg-muted/30 ${
                      idx % 2 === 0 ? "bg-background" : "bg-surface"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {txn.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {txn.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {txn.agent}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-semibold ${
                        txn.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {txn.amount > 0 ? "+" : ""}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          txn.status === "Completed" || txn.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                      {txn.reference}
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
