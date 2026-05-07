import { AuthProvider } from "@/contexts/auth-context";
import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { ReactNode } from "react";

export const metadata = {
  title: "Dashboard | El-Moore Real Estate",
  description: "Internal management dashboard for El-Moore Real Estate",
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar />
          {/* Main content area with proper centering */}
          <main className="flex-1 lg:ml-64 transition-all duration-300">
            <div className="h-full flex flex-col">
              <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
