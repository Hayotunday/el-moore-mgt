"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, type UserRole } from "@/contexts/auth-context";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

const roleNavItems = {
  admin: [
    { label: "Control Center", path: "/admin" },
    { label: "Users & Assets", path: "/admin" },
  ],
  hr_staff: [
    { label: "Attendance", path: "/hr" },
    { label: "Staff Hub", path: "/hr" },
  ],
  finance: [
    { label: "Transactions", path: "/finance" },
    { label: "Payouts", path: "/finance" },
  ],
  marketer: [
    { label: "Sales Report", path: "/marketer" },
    { label: "Commissions", path: "/marketer" },
  ],
};

export default function DashboardHeader() {
  const { user, switchRole } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!user) return null;

  const currentRoleItems = roleNavItems[user.role as UserRole] || [];
  const roles: UserRole[] = ["admin", "hr_staff", "finance", "marketer"];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground"
        >
          <img
            src={"/assets/el-moore.png"}
            alt="El-Moore Logo"
            className="h-14 w-32"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {currentRoleItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-[0.5rem] ${
                pathname === item.path
                  ? "text-foreground underline underline-offset-4 decoration-2"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Role Switcher & User */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-[0.5rem] transition-colors"
            >
              Switch Role
            </button>
            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      user.role === role
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {role === "admin"
                      ? "Admin"
                      : role === "hr_staff"
                        ? "HR & Staff"
                        : role === "finance"
                          ? "Finance"
                          : "Marketer"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <button className="p-2 rounded-md hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background p-4 space-y-2">
          {currentRoleItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground px-3 uppercase">
              Switch Role
            </p>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  switchRole(role);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  user.role === role
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {role === "admin"
                  ? "Admin"
                  : role === "hr_staff"
                    ? "HR & Staff"
                    : role === "finance"
                      ? "Finance"
                      : "Marketer"}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
