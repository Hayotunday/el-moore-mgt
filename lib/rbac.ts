import {
  LayoutDashboard,
  Building2,
  Wallet,
  Share2,
  Newspaper,
  BookOpen,
  Users,
  UserCog,
  ClipboardList,
  Clock,
  FileText,
  DollarSign,
  MapPinned,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/api/types";

export type { Role };

export const ROLES: Role[] = [
  "MD_GM",
  "OFFICE_ADMIN",
  "SITE_COORDINATOR",
  "TEAM_LEAD",
  "ACCOUNTANT",
  "CUSTOMER_CARE",
];

export const ROLE_LABELS: Record<Role, string> = {
  MD_GM: "Managing Director / GM",
  OFFICE_ADMIN: "Office Admin",
  SITE_COORDINATOR: "Site Coordinator",
  TEAM_LEAD: "Team Lead",
  ACCOUNTANT: "Accountant",
  CUSTOMER_CARE: "Customer Care",
};

export type PageKey =
  | "overview"
  | "properties"
  | "sales"
  | "referrals"
  | "inspections"
  | "newsletter"
  | "blog"
  | "customers"
  | "users"
  | "hr"
  | "attendance"
  | "daily-report"
  | "finance";

export interface PageDefinition {
  key: PageKey;
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  roles: Role[];
}

export const PAGE_REGISTRY: PageDefinition[] = [
  {
    key: "overview",
    label: "Overview",
    path: "/management/overview",
    description: "Daily activity at a glance",
    icon: LayoutDashboard,
    roles: [...ROLES],
  },
  {
    key: "properties",
    label: "Properties",
    path: "/management/properties",
    description: "Inventory & sale status",
    icon: Building2,
    roles: ["MD_GM", "OFFICE_ADMIN", "SITE_COORDINATOR"],
  },
  {
    key: "sales",
    label: "Sales",
    path: "/management/sales",
    description: "Outright & installment records",
    icon: Wallet,
    roles: ["MD_GM", "OFFICE_ADMIN", "SITE_COORDINATOR", "ACCOUNTANT"],
  },
  {
    key: "referrals",
    label: "Referrals",
    path: "/management/referrals",
    description: "Tag referrers & commissions",
    icon: Share2,
    roles: ["MD_GM", "OFFICE_ADMIN", "SITE_COORDINATOR", "ACCOUNTANT"],
  },
  {
    key: "inspections",
    label: "Site Inspections",
    path: "/management/inspections",
    description: "Customer land inspection requests",
    icon: MapPinned,
    roles: ["MD_GM", "OFFICE_ADMIN", "SITE_COORDINATOR"],
  },
  {
    key: "newsletter",
    label: "Newsletter",
    path: "/management/newsletter",
    description: "Bulk mail & automated greetings",
    icon: Newspaper,
    roles: ["MD_GM", "OFFICE_ADMIN", "CUSTOMER_CARE"],
  },
  {
    key: "blog",
    label: "Blog",
    path: "/management/blog",
    description: "Manage published articles",
    icon: BookOpen,
    roles: ["MD_GM", "OFFICE_ADMIN"],
  },
  {
    key: "customers",
    label: "Customers",
    path: "/management/customers",
    description: "Buyer records",
    icon: Users,
    roles: ["MD_GM", "OFFICE_ADMIN", "SITE_COORDINATOR", "CUSTOMER_CARE"],
  },
  {
    key: "users",
    label: "Users & Roles",
    path: "/management/users",
    description: "Manage internal access",
    icon: UserCog,
    roles: ["MD_GM", "OFFICE_ADMIN"],
  },
  {
    key: "hr",
    label: "HR",
    path: "/management/hr",
    description: "Staff stats & reports",
    icon: ClipboardList,
    roles: ["MD_GM", "OFFICE_ADMIN", "TEAM_LEAD"],
  },
  {
    key: "attendance",
    label: "Attendance",
    path: "/management/attendance",
    description: "Clock in / clock out",
    icon: Clock,
    roles: [...ROLES],
  },
  {
    key: "daily-report",
    label: "Daily Report",
    path: "/management/daily-report",
    description: "Submit today's report",
    icon: FileText,
    roles: [...ROLES],
  },
  {
    key: "finance",
    label: "Finance",
    path: "/management/finance",
    description: "Office transactions",
    icon: DollarSign,
    roles: ["MD_GM", "OFFICE_ADMIN", "ACCOUNTANT"],
  },
];

export function getPagesForRole(role: Role | undefined | null): PageDefinition[] {
  if (!role) return [];
  return PAGE_REGISTRY.filter((page) => page.roles.includes(role));
}

export function findPageForPath(pathname: string): PageDefinition | undefined {
  return PAGE_REGISTRY.find(
    (page) => pathname === page.path || pathname.startsWith(page.path + "/"),
  );
}

export function canAccessPath(role: Role | undefined | null, pathname: string): boolean {
  const page = findPageForPath(pathname);
  if (!page) return true;
  if (!role) return false;
  return page.roles.includes(role);
}
