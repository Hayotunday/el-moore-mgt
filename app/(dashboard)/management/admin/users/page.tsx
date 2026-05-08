"use client";

import { Edit, Trash2, ShieldCheck, Briefcase } from "lucide-react";
import StatCard from "@/components/dashboard-stat-card";
import { EditDialog } from "@/components/ui/edit-dialog";

// This would ideally come from your mock data library
const mockMarketers = [
  {
    id: "1",
    name: "John Marketer",
    email: "john@elmoore.com",
    performance: "High",
    activeListings: 12,
    status: "Active",
  },
  {
    id: "2",
    name: "Sarah Sales",
    email: "sarah@elmoore.com",
    performance: "Medium",
    activeListings: 8,
    status: "Active",
  },
];

export default function MarketerManagementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          Marketer Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor performance and manage external sales agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Marketers"
          value={mockMarketers.length}
          icon={<Briefcase className="h-6 w-6" />}
        />
        <StatCard
          label="Active Campaigns"
          value="5"
          icon={<ShieldCheck className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Top Performer"
          value="John Marketer"
          sublabel="12 Sales this month"
          variant="accent"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Marketer Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                  Listings
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Performance
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
              {mockMarketers.map((marketer) => (
                <tr
                  key={marketer.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {marketer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {marketer.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {marketer.activeListings}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        marketer.performance === "High"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {marketer.performance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {marketer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <EditDialog
                        title="Edit Marketer"
                        description="Update marketer details without leaving the page."
                        trigger={
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title={`Edit ${marketer.name}`}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                        }
                      >
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-foreground">
                            Name
                          </span>
                          <input
                            type="text"
                            defaultValue={marketer.name}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-foreground">
                            Email
                          </span>
                          <input
                            type="email"
                            defaultValue={marketer.email}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-foreground">
                            Listings
                          </span>
                          <input
                            type="number"
                            defaultValue={marketer.activeListings}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-foreground">
                            Performance
                          </span>
                          <select
                            defaultValue={marketer.performance}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-foreground">
                            Status
                          </span>
                          <select
                            defaultValue={marketer.status}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          >
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                        </label>
                      </EditDialog>
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
    </div>
  );
}
