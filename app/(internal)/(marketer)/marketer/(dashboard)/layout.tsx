"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketerHeader from "@/components/marketer/marketer-header";
import MarketerSidebar from "@/components/marketer/marketer-sidebar";
import { useAuth } from "@/contexts/auth-context";

export default function MarketerDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isMarketer = user?.role === "AFFILIATE_MARKETER";

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isMarketer) {
      router.replace("/marketer");
    }
  }, [isLoading, user, isMarketer, router]);

  if (isLoading || !user || !isMarketer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketerHeader />
      <MarketerSidebar />
      <main className="flex-1 transition-all duration-300 lg:ml-16">
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
