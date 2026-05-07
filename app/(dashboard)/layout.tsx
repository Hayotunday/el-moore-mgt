import { AuthProvider } from "@/contexts/auth-context";
import DashboardHeader from "@/components/dashboard-header";
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
        <main className="container py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
