"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ManagementHeader from "@/components/management/management-header";
import ManagementSidebar from "@/components/management/management-sidebar";
import { useAuth } from "@/contexts/auth-context";

export default function ManagementDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, hasAccess } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/management");
      return;
    }
    if (pathname && !hasAccess(pathname)) {
      router.replace("/management/overview");
    }
  }, [isLoading, user, pathname, hasAccess, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (pathname && !hasAccess(pathname)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ManagementHeader />
      <ManagementSidebar />
      <main className="flex-1 transition-all duration-300 lg:ml-16">
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
