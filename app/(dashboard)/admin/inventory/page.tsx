"use client";

import RoleGuard from "@/components/role-guard";
import { adminProperties } from "@/lib/dashboardMockData";
import { Edit, Trash2, Eye } from "lucide-react";

export default function InventoryManagementPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Property Inventory
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage all properties and their listing status
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            Add Property
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total Properties
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {adminProperties.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Active Listings
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {adminProperties.filter((p) => p.status === "Active").length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Total Portfolio Value
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(
                adminProperties.reduce((sum, p) => sum + p.price, 0)
              )}
            </p>
          </div>
        </div>

        {/* Properties Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Property Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Views / Offers
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {adminProperties.map((property, idx) => (
                  <tr
                    key={property.id}
                    className={`border-b border-border transition-colors hover:bg-muted/30 ${
                      idx % 2 === 0 ? "bg-background" : "bg-surface"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {property.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {property.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground text-right">
                      {formatCurrency(property.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {property.agent}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          property.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground text-center">
                      {property.views} / {property.offers}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="View property">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit property">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Delete property">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
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
