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
  HardHat,
  Handshake,
  CircleUser,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/api/types";

export type { Role };

/** The subset of the backend's full role enum that gets access to /management/**. */
export const MANAGEMENT_ROLES: Role[] = [
  "MD",
  "GM",
  "OFFICE_ADMIN",
  "SITE_COORDINATOR",
  "TEAM_LEAD",
  "ACCOUNTANT",
  "CUSTOMER_CARE",
  "PROJECT_MANAGER",
];

/** Every role the backend knows about, for display purposes (e.g. a user's role badge).
 *  AFFILIATE_MARKETER was renamed from EXTERNAL_MARKETER (naming only, same behavior). */
export const ROLE_LABELS: Record<Role, string> = {
  MD: "Managing Director",
  GM: "General Manager",
  OFFICE_ADMIN: "Office Admin",
  SITE_COORDINATOR: "Site Coordinator",
  TEAM_LEAD: "Team Lead",
  ACCOUNTANT: "Accountant",
  CUSTOMER_CARE: "Customer Care",
  PROJECT_MANAGER: "Project Manager",
  INTERNAL_MARKETER: "Internal Marketer",
  AFFILIATE_MARKETER: "Affiliate Marketer",
  basic: "Basic Account",
};

export type PageKey =
  | "overview"
  | "properties"
  | "sales"
  | "referrals"
  | "marketers"
  | "inspections"
  | "newsletter"
  | "blog"
  | "customers"
  | "users"
  | "hr"
  | "attendance"
  | "daily-report"
  | "finance"
  | "projects"
  | "account";

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
    roles: [...MANAGEMENT_ROLES],
  },
  {
    key: "properties",
    label: "Properties",
    path: "/management/properties",
    description: "Inventory & sale status",
    icon: Building2,
    roles: ["MD", "GM", "OFFICE_ADMIN", "SITE_COORDINATOR"],
  },
  {
    key: "sales",
    label: "Sales",
    path: "/management/sales",
    description: "Outright & installment records",
    icon: Wallet,
    roles: ["MD", "GM", "OFFICE_ADMIN", "TEAM_LEAD", "ACCOUNTANT"],
  },
  {
    key: "referrals",
    label: "Referrals",
    path: "/management/referrals",
    description: "Marketer commissions",
    icon: Share2,
    roles: ["MD", "GM", "OFFICE_ADMIN"],
  },
  {
    key: "marketers",
    label: "Affiliate Marketers",
    path: "/management/marketers",
    description: "Marketer registrations, approvals & metrics",
    icon: Handshake,
    roles: ["MD", "GM", "OFFICE_ADMIN"],
  },
  {
    key: "inspections",
    label: "Site Inspections",
    path: "/management/inspections",
    description: "Customer land inspection requests",
    icon: MapPinned,
    roles: ["MD", "GM", "OFFICE_ADMIN", "SITE_COORDINATOR"],
  },
  {
    key: "newsletter",
    label: "Newsletter",
    path: "/management/newsletter",
    description: "Campaigns & notification log",
    icon: Newspaper,
    roles: ["MD", "GM", "OFFICE_ADMIN", "CUSTOMER_CARE"],
  },
  {
    key: "blog",
    label: "Blog",
    path: "/management/blog",
    description: "Manage published articles",
    icon: BookOpen,
    roles: ["MD", "GM", "OFFICE_ADMIN"],
  },
  {
    key: "customers",
    label: "Customers",
    path: "/management/customers",
    description: "Buyer records",
    icon: Users,
    roles: [
      "MD",
      "GM",
      "OFFICE_ADMIN",
      "TEAM_LEAD",
      "CUSTOMER_CARE",
      "ACCOUNTANT",
    ],
  },
  {
    key: "users",
    label: "Users & Roles",
    path: "/management/users",
    description: "Manage internal access",
    icon: UserCog,
    roles: ["MD", "GM", "OFFICE_ADMIN"],
  },
  {
    key: "hr",
    label: "HR",
    path: "/management/hr",
    description: "Staff stats & reports",
    icon: ClipboardList,
    roles: ["MD", "GM", "OFFICE_ADMIN", "TEAM_LEAD"],
  },
  {
    key: "attendance",
    label: "Attendance",
    path: "/management/attendance",
    description: "Clock in / clock out",
    icon: Clock,
    roles: [
      "OFFICE_ADMIN",
      "SITE_COORDINATOR",
      "TEAM_LEAD",
      "ACCOUNTANT",
      "CUSTOMER_CARE",
      "PROJECT_MANAGER",
    ],
  },
  {
    key: "daily-report",
    label: "Daily Report",
    path: "/management/daily-report",
    description: "Submit today's report",
    icon: FileText,
    roles: [...MANAGEMENT_ROLES],
  },
  {
    key: "finance",
    label: "Finance",
    path: "/management/finance",
    description: "Office transactions",
    icon: DollarSign,
    roles: ["MD", "GM", "OFFICE_ADMIN", "ACCOUNTANT"],
  },
  {
    key: "projects",
    label: "Projects",
    path: "/management/projects",
    description: "Construction progress & work items",
    icon: HardHat,
    roles: ["MD", "GM", "PROJECT_MANAGER"],
  },
  {
    key: "account",
    label: "My Account",
    path: "/management/account",
    description: "Profile & security settings",
    icon: CircleUser,
    roles: [...MANAGEMENT_ROLES],
  },
];

export function getPagesForRole(
  role: Role | undefined | null,
): PageDefinition[] {
  if (!role) return [];
  return PAGE_REGISTRY.filter((page) => page.roles.includes(role));
}

export function findPageForPath(pathname: string): PageDefinition | undefined {
  return PAGE_REGISTRY.find(
    (page) => pathname === page.path || pathname.startsWith(page.path + "/"),
  );
}

export function canAccessPath(
  role: Role | undefined | null,
  pathname: string,
): boolean {
  const page = findPageForPath(pathname);
  if (!page) return true;
  if (!role) return false;
  return page.roles.includes(role);
}
