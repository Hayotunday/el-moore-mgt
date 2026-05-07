"use client";

import RoleGuard from "@/components/role-guard";
import { commissionDisbursements } from "@/lib/dashboardMockData";
import { Download } from "lucide-react";

export default function CommissionsPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalDisbursed = commissionDisbursements.reduce(
    (sum, disb) => sum + disb.disbursed,
    0
  );
  const pendingPayments = commissionDisbursements.filter(
    (disb) => disb.status === "Pending"
  ).length;
  const processingPayments = commissionDisbursements.filter(
    (disb) => disb.status === "Processing"
  ).length;
  const paidPayments = commissionDisbursements.filter(
    (disb) => disb.status === "Paid"
  ).length;

  return (
    <RoleGuard allowedRoles={["finance"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Commission Payouts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and disburse agent commissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total Disbursed
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(totalDisbursed)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Pending
            </p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {pendingPayments}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Processing
            </p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              {processingPayments}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Paid
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {paidPayments}
            </p>
          </div>
        </div>

        {/* Commission Disbursement Cards */}
        <div className="space-y-4">
          {commissionDisbursements.map((disb) => (
            <div
              key={disb.id}
              className="rounded-lg border border-border bg-background p-6 space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">
                      {disb.agent}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        disb.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : disb.status === "Pending"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {disb.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Period:</span> {disb.period}
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Download receipt"
                >
                  <Download className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Total Earned
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(disb.totalEarned)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Disbursed
                  </p>
                  <p className="text-2xl font-bold text-gold">
                    {formatCurrency(disb.disbursed)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Payment Date
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {disb.paymentDate}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                {disb.status === "Pending" && (
                  <>
                    <button className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium">
                      Reject
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                      Approve & Process
                    </button>
                  </>
                )}
                {disb.status === "Processing" && (
                  <button className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm font-medium">
                    Processing...
                  </button>
                )}
                {disb.status === "Paid" && (
                  <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
                    View Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
