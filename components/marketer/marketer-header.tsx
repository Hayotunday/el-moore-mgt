"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ROLE_LABELS } from "@/lib/rbac";
import { findMarketerNavForPath } from "./marketer-nav";
import { getFullName, getInitials } from "@/lib/utils";

export default function MarketerHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const currentPage = pathname ? findMarketerNavForPath(pathname) : undefined;

  const initials = user ? getInitials(user) : "";

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-center bg-background/95 shadow-ambient backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/marketer/overview" className="flex shrink-0 items-center">
          <img src="/assets/el-moore.png" alt="El-Moore Logo" className="h-10 w-auto" />
        </Link>

        <p className="hidden text-sm font-medium text-muted-foreground sm:block">
          {currentPage?.label ?? "Marketer Portal"}
        </p>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {getFullName(user)}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-secondary-foreground text-xs font-bold overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={getFullName(user)} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
