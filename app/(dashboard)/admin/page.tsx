"use client";

import { useState } from "react";
import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import {
  adminDashboardStats,
  adminProperties,
  adminUsers,
  promotionTemplate,
} from "@/lib/dashboardMockData";
import {
  DollarSign,
  Users,
  Home,
  TrendingUp,
  Send,
  Edit,
  Trash2,
} from "lucide-react";

export default function AdminDashboard() {
  const [promotionModal, setPromotionModal] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState(promotionTemplate);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"properties" | "users">(
    "properties"
  );

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
            Manage inventory, users, and critical operations
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

        {/* Bulk Messaging Section */}
        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Send Bulk Messages & Promotions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compose and send custom messages to registered users
              </p>
            </div>
            <button
              onClick={() => setPromotionModal(!promotionModal)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Send className="h-4 w-4" />
              Compose Message
            </button>
          </div>

          {promotionModal && (
            <div className="space-y-4 mt-6 pt-6 border-t border-border">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Message
                </label>
                <textarea
                  value={promotionMessage}
                  onChange={(e) => setPromotionMessage(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Select Recipients
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {adminUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(
                              selectedUsers.filter((id) => id !== user.id)
                            );
                          }
                        }}
                        className="rounded border-border"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setPromotionModal(false);
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Send to {selectedUsers.length} Recipients
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties & Users Management */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "properties"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Property Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              User Management
            </button>
          </div>

          {/* Properties Table */}
          {activeTab === "properties" && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                        Property
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
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
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
          )}

          {/* Users Table */}
          {activeTab === "users" && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                        Sale Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border transition-colors hover:bg-muted/30 ${
                          idx % 2 === 0 ? "bg-background" : "bg-surface"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground text-right">
                          {user.totalSales}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground text-right">
                          {formatCurrency(user.totalValue)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
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
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
