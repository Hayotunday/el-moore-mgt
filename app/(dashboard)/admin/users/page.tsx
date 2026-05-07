"use client";

import { useState } from "react";
import RoleGuard from "@/components/role-guard";
import { adminUsers, promotionTemplate } from "@/lib/dashboardMockData";
import { Send, Edit, Trash2, Mail } from "lucide-react";

export default function UserManagementPage() {
  const [promotionModal, setPromotionModal] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState(promotionTemplate);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage registered users and send bulk communications
          </p>
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            >
              <Mail className="h-4 w-4" />
              Compose Message
            </button>
          </div>

          {promotionModal && (
            <div className="space-y-4 mt-6 pt-6 border-t border-border">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Message Subject (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Exclusive Property Listings"
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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
                  Select Recipients ({selectedUsers.length} selected)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {user.role}
                      </span>
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
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedUsers.length === 0}>
                  Send to {selectedUsers.length} Recipient{selectedUsers.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
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
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Edit user">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Delete user">
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
