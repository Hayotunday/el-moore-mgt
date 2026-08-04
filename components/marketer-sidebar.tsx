"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const marketerSections = [
  {
    label: "Dashboard",
    path: "/marketer",
    icon: "🏠",
    description: "Overview & stats",
  },
  {
    label: "Sales Report",
    path: "/marketer/sales",
    icon: "📈",
    description: "Completed transactions",
  },
  {
    label: "Commission History",
    path: "/marketer/history",
    icon: "💰",
    description: "Earnings tracking",
  },
  {
    label: "Lead Generation",
    path: "/marketer/leads",
    icon: "👥",
    description: "Manage prospects",
  },
];

export default function MarketerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render the sidebar on the registration route
  if (pathname === "/marketer/register") return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="group hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 w-16 overflow-hidden border-r border-border bg-muted/90 transition-all duration-300 hover:w-64"
        aria-label="Marketer portal navigation"
      >
        <nav
          className="flex-1 space-y-1 p-2"
          role="navigation"
          aria-label="Marketer sections"
        >
          {marketerSections.map((section) => {
            const isActive = pathname === section.path;
            return (
              <Link
                key={section.path}
                href={section.path}
                aria-label={section.label}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span className="shrink-0 text-lg">{section.icon}</span>
                <div className="hidden group-hover:block">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {section.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background shadow-lg"
        aria-label={
          mobileOpen ? "Close marketer navigation" : "Open marketer navigation"
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
                  Marketer Portal
                </p>
                <p className="text-sm text-muted-foreground">
                  Navigate your sales dashboard
                </p>
              </div>
              <button
                className="p-2 rounded-md bg-muted/70 text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close marketer navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Portal Sections
              </p>
              {marketerSections.map((section) => {
                const isActive =
                  pathname === section.path ||
                  (pathname?.startsWith(section.path + "/") ?? false);
                return (
                  <Link
                    key={section.path}
                    href={section.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-4 transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{section.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
