"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

interface DashboardItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const dashboardItems: Record<string, DashboardItem[]> = {
  admin: [
    { label: "Control Center", path: "/admin", icon: <LayoutDashboard /> },
    { label: "User Management", path: "/admin/users", icon: <Users /> },
    { label: "Property Inventory", path: "/admin/inventory", icon: <Briefcase /> },
  ],
  hr_staff: [
    { label: "Attendance", path: "/hr", icon: <LayoutDashboard /> },
    { label: "Disciplinary Log", path: "/hr/discipline", icon: <TrendingUp /> },
    { label: "Task Roster", path: "/hr/tasks", icon: <Users /> },
  ],
  finance: [
    { label: "Overview", path: "/finance", icon: <LayoutDashboard /> },
    { label: "Transactions", path: "/finance/transactions", icon: <Briefcase /> },
    { label: "Commission Payouts", path: "/finance/commissions", icon: <TrendingUp /> },
  ],
  marketer: [
    { label: "Profile", path: "/marketer", icon: <LayoutDashboard /> },
    { label: "Sales Report", path: "/marketer/sales", icon: <TrendingUp /> },
    { label: "Commission History", path: "/marketer/history", icon: <Briefcase /> },
    { label: "Lead Generation", path: "/marketer/leads", icon: <Users /> },
  ],
};

export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  if (!user) return null;

  const items = dashboardItems[user.role] || [];
  const currentRole = user.role === "admin" ? "Admin" : user.role === "hr_staff" ? "HR & Staff" : user.role === "finance" ? "Finance" : "Marketer";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3 bg-primary text-background rounded-full shadow-lg"
      >
        {sidebarExpanded ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-30 bg-muted/30 border-r border-border transition-all duration-300 overflow-y-auto ${
          sidebarExpanded ? "w-64" : "w-16"
        } lg:w-64`}
      >
        {/* Logo/Role Indicator */}
        <div
          className={`h-16 flex items-center gap-3 px-4 border-b border-border transition-all duration-300 ${
            !sidebarExpanded && "lg:justify-center"
          }`}
        >
          <div className={`p-2 bg-primary/10 rounded-lg ${!sidebarExpanded && "lg:p-3"}`}>
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          {(sidebarExpanded || window.innerWidth >= 1024) && (
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Dashboard
              </p>
              <p className="text-sm font-bold text-foreground">{currentRole}</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {item.icon}
                </span>
                {(sidebarExpanded || window.innerWidth >= 1024) && (
                  <span className="hidden lg:inline text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Hint */}
        {(sidebarExpanded || window.innerWidth >= 1024) && (
          <div className="hidden lg:block p-4 mt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Hover to expand on desktop
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {sidebarExpanded && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
    </>
  );
}
