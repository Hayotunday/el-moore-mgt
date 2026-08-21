"use client";

import { marketerSalesReport } from "@/lib/dashboardMockData";
import { TrendingUp, Award } from "lucide-react";

export default function SalesReportPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalSales = marketerSalesReport.reduce(
    (sum, sale) => sum + sale.salePrice,
    0,
  );
  const totalCommission = marketerSalesReport.reduce(
    (sum, sale) => sum + sale.commission,
    0,
  );
  const avgCommissionRate = ((totalCommission / totalSales) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">My Sales Report</h1>
        <p className="text-muted-foreground mt-2">
          View your completed transactions and earnings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Sales
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {marketerSalesReport.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalSales)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Commission
          </p>
          <p className="text-2xl font-bold text-gold mt-2">
            {formatCurrency(totalCommission)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Avg Commission Rate
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            {avgCommissionRate}%
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Sale Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                  Sale Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {marketerSalesReport.map((sale, idx) => (
                <tr
                  key={sale.id}
                  className={`border-b border-border transition-colors hover:bg-muted/30 ${
                    idx % 2 === 0 ? "bg-background" : "bg-surface"
                  }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {sale.propertyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {sale.saleDate}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground text-right">
                    {formatCurrency(sale.salePrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gold text-right font-semibold">
                    {formatCurrency(sale.commission)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
