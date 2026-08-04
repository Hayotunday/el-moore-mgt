"use client";

import { commissionHistory } from "@/lib/dashboardMockData";
import { CheckCircle2, Clock, DollarSign } from "lucide-react";

export default function CommissionHistoryPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalEarned = commissionHistory.reduce(
    (sum, commission) => sum + commission.earned,
    0,
  );
  const paidEarnings = commissionHistory
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.earned, 0);
  const pendingEarnings = commissionHistory
    .filter((c) => c.status === "Pending")
    .reduce((sum, c) => sum + c.earned, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          Commission History
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your commission earnings over time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Total Earned
              </p>
              <p className="text-2xl font-bold text-gold mt-2">
                {formatCurrency(totalEarned)}
              </p>
            </div>
            <DollarSign className="h-5 w-5 text-gold" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Already Paid
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(paidEarnings)}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Pending Payment
              </p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {formatCurrency(pendingEarnings)}
              </p>
            </div>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Commission History Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Payment Details
        </h2>
        {commissionHistory.map((commission, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-background p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {commission.period}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      commission.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {commission.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Processed on{" "}
                  <span className="font-medium">{commission.date}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gold">
                  {formatCurrency(commission.earned)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
