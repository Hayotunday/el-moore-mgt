"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { dashboardGroups, dashboardItems } from "@/lib/navigation";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeGroup =
    dashboardGroups.find(
      (group) =>
        pathname === group.path || pathname.startsWith(group.path + "/"),
    )?.role ||
    dashboardGroups[0]?.role ||
    "admin";

  const currentItems = dashboardItems[activeGroup] || [];

  return (
    <>
      {/* Desktop Sidebar Group Selector */}
      <aside
        className="group hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 w-16 overflow-hidden border-r border-border bg-muted/90 transition-all duration-300 hover:w-64"
        aria-label="Dashboard group selector"
      >
        <nav
          className="flex-1 space-y-1 p-2"
          role="navigation"
          aria-label="Dashboard groups"
        >
          {dashboardGroups.map((group) => {
            const isActive = activeGroup === group.role;
            return (
              <Link
                key={group.role}
                href={group.path}
                aria-label={group.label}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className="shrink-0">{group.icon}</span>
                <span className="hidden text-sm font-medium group-hover:inline truncate">
                  {group.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background shadow-lg"
        aria-label={
          mobileOpen
            ? "Close dashboard navigation"
            : "Open dashboard navigation"
        }
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile drawer */}
      {mounted && mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  Dashboard navigation
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a dashboard and section
                </p>
              </div>
              <button
                className="p-2 rounded-md bg-muted/70 text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close dashboard navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-border">
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Dashboard groups
                </p>
                {dashboardGroups.map((group) => {
                  const isActive = activeGroup === group.role;
                  return (
                    <Link
                      key={group.role}
                      href={group.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span className="shrink-0">{group.icon}</span>
                      <span className="text-sm font-medium">{group.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Current dashboard
                </p>
                {currentItems.map((item) => {
                  const isActive =
                    pathname === item.path ||
                    pathname.startsWith(item.path + "/");
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
