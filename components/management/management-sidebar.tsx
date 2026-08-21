"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ROLE_LABELS } from "@/lib/rbac";

export default function ManagementSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, pages, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/management");
  };

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="group hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 w-16 overflow-hidden bg-muted/70 transition-all duration-300 hover:w-64"
        aria-label="Management navigation"
      >
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-2"
          role="navigation"
          aria-label="Management pages"
        >
          {pages.map((page) => {
            const isActive =
              pathname === page.path || pathname?.startsWith(page.path + "/");
            const Icon = page.icon;
            return (
              <Link
                key={page.key}
                href={page.path}
                aria-label={page.label}
                aria-current={isActive ? "page" : undefined}
                className={`group/item flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden truncate group-hover:inline">{page.label}</span>
                {isActive && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-gold group-hover:inline-block" />}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="border-t border-border/60 p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-sm px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden truncate group-hover:inline">Log out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile drawer */}
      {mounted && mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" role="dialog" aria-modal="true">
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-background shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-base font-semibold text-foreground">
                  {user ? user.name : "Management"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user ? ROLE_LABELS[user.role] : "Navigate the dashboard"}
                </p>
              </div>
              <button
                className="p-2 rounded-md bg-muted/70 text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 p-4">
              {pages.map((page) => {
                const isActive =
                  pathname === page.path || pathname?.startsWith(page.path + "/");
                const Icon = page.icon;
                return (
                  <Link
                    key={page.key}
                    href={page.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-3 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">{page.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
