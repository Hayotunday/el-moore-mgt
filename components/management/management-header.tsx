"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROLE_LABELS } from "@/lib/rbac";
import { findPageForPath } from "@/lib/rbac";

export default function ManagementHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentPage = pathname ? findPageForPath(pathname) : undefined;

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-center border-b border-primary/10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/management/overview"
          className="flex shrink-0 items-center"
        >
          <img
            src="/assets/el-moore.png"
            alt="El-Moore Logo"
            className="h-10 w-auto"
          />
        </Link>

        <p className="hidden text-sm font-medium text-muted-foreground sm:block">
          {currentPage?.label ?? "Management"}
        </p>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-secondary-foreground text-xs font-bold">
              {initials}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
