"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, Building2, Share2, ArrowRight } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import { useAuth } from "@/contexts/auth-context";
import { getPagesForRole } from "@/lib/rbac";
import { listTodayReports } from "@/lib/api/daily-reports";
import { listAttendance } from "@/lib/api/attendance";
import { listProperties } from "@/lib/api/properties";
import { listReferrals, type ReferralWithSale } from "@/lib/api/referrals";
import { listUsers } from "@/lib/api/users";
import type { DailyTaskReport } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

export default function OverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<DailyTaskReport[]>([]);
  const [presentToday, setPresentToday] = useState(0);
  const [staffTotal, setStaffTotal] = useState(0);
  const [soldThisPeriod, setSoldThisPeriod] = useState(0);
  const [pendingCommissions, setPendingCommissions] = useState<ReferralWithSale[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [todayReports, attendance, properties, referrals, users] = await Promise.all([
        listTodayReports(),
        listAttendance(),
        listProperties(),
        listReferrals(),
        listUsers(),
      ]);
      if (!active) return;
      setReports(todayReports);
      const todayStr = new Date().toISOString().slice(0, 10);
      setPresentToday(attendance.filter((a) => a.date === todayStr).length);
      setStaffTotal(users.length);
      setSoldThisPeriod(properties.filter((p) => p.status === "SOLD").length);
      setPendingCommissions(referrals.filter((r) => r.status === "PENDING"));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  const isLeadership = user.role === "MD_GM" || user.role === "OFFICE_ADMIN";
  const quickLinks = getPagesForRole(user.role).filter((p) => p.key !== "overview");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here's what's moving across El-Moore today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Present Today"
          value={loading ? "…" : `${presentToday}/${staffTotal}`}
          sublabel="Staff clocked in"
          icon={<Users className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Reports Submitted"
          value={loading ? "…" : reports.length}
          sublabel="Today's daily task reports"
          icon={<ClipboardList className="h-6 w-6" />}
        />
        {isLeadership || user.role === "SITE_COORDINATOR" ? (
          <StatCard
            label="Properties Sold"
            value={loading ? "…" : soldThisPeriod}
            sublabel="Total to date"
            icon={<Building2 className="h-6 w-6" />}
            variant="gold"
          />
        ) : (
          <StatCard
            label="Your Role"
            value={user.role.replace(/_/g, " ")}
            sublabel="Access level"
            icon={<Building2 className="h-6 w-6" />}
          />
        )}
        <StatCard
          label="Pending Commissions"
          value={loading ? "…" : pendingCommissions.length}
          sublabel={
            loading
              ? undefined
              : formatCurrency(pendingCommissions.reduce((sum, r) => sum + r.commissionAmount, 0))
          }
          icon={<Share2 className="h-6 w-6" />}
          variant="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)]">
          <h2 className="text-lg font-semibold text-foreground mb-1">Today&apos;s Task Reports</h2>
          <p className="text-sm text-muted-foreground mb-5">
            What the team has logged so far today.
          </p>
          <div className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!loading && reports.length === 0 && (
              <p className="text-sm text-muted-foreground">No reports submitted yet today.</p>
            )}
            {reports.map((report) => (
              <div key={report.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{report.staffName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleTimeString("en-NG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{report.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)]">
          <h2 className="text-lg font-semibold text-foreground mb-1">Your Desks</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pages available to your role.
          </p>
          <div className="space-y-2">
            {quickLinks.map((page) => (
              <Link
                key={page.key}
                href={page.path}
                className="flex items-center justify-between gap-3 rounded-sm bg-muted/40 px-4 py-3 hover:bg-gold/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <page.icon className="h-4 w-4 text-gold" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{page.label}</p>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
