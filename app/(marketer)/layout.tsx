import { ReactNode } from "react";
import MarketerHeader from "@/components/marketer-header";
import MarketerSidebar from "@/components/marketer-sidebar";

export const metadata = {
  title: "Marketer Portal | El-Moore Real Estate",
  description: "External sales agent portal for El-Moore Real Estate",
};

export default function MarketerLayout({ children }: { children: ReactNode }) {
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
