"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { dashboardGroups, dashboardItems } from "@/lib/navigation";

export default function DashboardHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeGroup =
    dashboardGroups.find(
      (group) =>
        pathname === group.path || pathname.startsWith(group.path + "/"),
    )?.role ||
    dashboardGroups[0]?.role ||
    "admin";

  const currentItems = dashboardItems[activeGroup] || [];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-center w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-foreground shrink-0"
          >
            <img
              src={"/assets/el-moore.png"}
              alt="El-Moore Logo"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-1 mx-4">
          {currentItems.map((item) => (
            <Link
              key={`${item.path}-${item.label}`}
              href={item.path}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 lg:gap-4">
          <div className="flex items-center gap-3 pl-4 border-l border-border">
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
          {currentItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
