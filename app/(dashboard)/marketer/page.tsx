"use client";

import { useState } from "react";
import RoleGuard from "@/components/role-guard";
import StatCard from "@/components/dashboard-stat-card";
import {
  marketerProfile,
  marketerSalesReport,
  commissionHistory,
  leads,
} from "@/lib/dashboardMockData";
import { TrendingUp, DollarSign, Users, Send, Trash2 } from "lucide-react";

export default function MarketerPortal() {
  const [activeTab, setActiveTab] = useState<
    "sales" | "commissions" | "leads"
  >("sales");
  const [leadForm, setLeadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyType: "",
    budget: "",
  });

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
    0
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset form
    setFormData({ name: "", email: "", phone: "", propertyType: "", budget: "" });
    setLeadForm(false);
  };

  return (
    <RoleGuard allowedRoles={["marketer"]}>
      <div className="space-y-8">
        {/* Header & Profile Card */}
        <div className="rounded-lg border border-border bg-muted/30 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-foreground">
                {marketerProfile.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                External Sales Agent
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{marketerProfile.email}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Phone:</span>{" "}
                  <span className="font-medium">{marketerProfile.phone}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Member Since:</span>{" "}
                  <span className="font-medium">{marketerProfile.joinDate}</span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-background p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Active Listings
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {marketerProfile.totalListings}
                </p>
              </div>
              <div className="rounded-lg bg-background p-4 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Completed Sales
                </p>
                <p className="text-3xl font-bold text-gold">
                  {marketerProfile.completedSales}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Total Commission Earned"
            value={formatCurrency(totalCommissions)}
            sublabel="From all sales"
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
            label="Total Leads"
            value={leads.length}
            sublabel="In database"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "sales"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            My Sales Report
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "commissions"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Commission History
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "leads"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Lead Generation
          </button>
        </div>

        {/* Sales Report */}
        {activeTab === "sales" && (
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
        )}

        {/* Commission History */}
        {activeTab === "commissions" && (
          <div className="space-y-4">
            {commissionHistory.map((commission, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-background p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-foreground">
                    {commission.period}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Processed on {commission.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold">
                    {formatCurrency(commission.earned)}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-2">
                    {commission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lead Generation Form */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Generate New Leads
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submit lead information to expand your prospect database
                  </p>
                </div>
                <button
                  onClick={() => setLeadForm(!leadForm)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Send className="h-4 w-4" />
                  Add Lead
                </button>
              </div>

              {leadForm && (
                <form
                  onSubmit={handleFormSubmit}
                  className="space-y-4 mt-6 pt-6 border-t border-border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="+234 801 234 5678"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Interested Property Type
                      </label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            propertyType: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Select property type</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="luxury">Luxury</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Budget (NGN)
                      </label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="50,000,000"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setLeadForm(false)}
                      className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Submit Lead
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Leads List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Your Leads
              </h3>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-lg border border-border bg-background p-6 flex items-start justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {lead.name}
                      </h4>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          lead.status === "Qualified"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "Contacted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lead.email} • {lead.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Interested in: <span className="font-medium">{lead.interestedProperty}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Budget: <span className="font-medium text-foreground">{formatCurrency(lead.budget)}</span> • Source: {lead.source}
                    </p>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
