import { LayoutDashboard, Share2, Settings, type LucideIcon } from "lucide-react";

export interface MarketerNavItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const MARKETER_NAV: MarketerNavItem[] = [
  { key: "overview", label: "Overview", path: "/marketer/overview", icon: LayoutDashboard },
  { key: "referrals", label: "Referrals", path: "/marketer/referrals", icon: Share2 },
  { key: "settings", label: "Settings", path: "/marketer/settings", icon: Settings },
];

export function findMarketerNavForPath(pathname: string): MarketerNavItem | undefined {
  return MARKETER_NAV.find(
    (item) => pathname === item.path || pathname.startsWith(item.path + "/"),
  );
}
