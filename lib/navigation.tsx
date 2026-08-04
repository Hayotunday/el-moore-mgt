import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  CalendarDays,
  Wallet,
} from "lucide-react";
import React from "react";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface NavGroup {
  label: string;
  path: string;
  role: string;
  icon: React.ReactNode;
}

export const dashboardGroups: NavGroup[] = [
  {
    label: "Admin",
    path: "/management/admin",
    role: "admin",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "HR & Staff",
    path: "/management/hr",
    role: "hr_staff",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    label: "Finance",
    path: "/management/finance",
    role: "finance",
    icon: <Wallet className="h-4 w-4" />,
  },
];

export const dashboardItems: Record<string, NavItem[]> = {
  admin: [
    {
      label: "Control Center",
      path: "/management/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Customers",
      path: "/management/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Marketers",
      path: "/management/admin/marketers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Property Inventory",
      path: "/management/admin/inventory",
      icon: <Briefcase className="h-4 w-4" />,
    },
  ],
  hr_staff: [
    {
      label: "Attendance",
      path: "/management/hr",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Disciplinary Log",
      path: "/management/hr/discipline",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Task Roster",
      path: "/management/hr/tasks",
      icon: <Users className="h-4 w-4" />,
    },
  ],
  finance: [
    {
      label: "Overview",
      path: "/management/finance",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Transactions",
      path: "/management/finance/transactions",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      label: "Commission Payouts",
      path: "/management/finance/commissions",
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ],
};
