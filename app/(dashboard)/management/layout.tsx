import { ReactNode } from "react";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";

export const metadata = {
  title: "Dashboard | El-Moore Real Estate",
  description: "Internal management dashboard for El-Moore Real Estate",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <DashboardSidebar />
      <main className="flex-1 transition-all duration-300 lg:ml-16">
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
