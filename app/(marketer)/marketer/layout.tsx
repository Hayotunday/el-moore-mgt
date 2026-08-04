import { ReactNode } from "react";
import MarketerHeader from "@/components/marketer-header";
import MarketerSidebar from "@/components/marketer-sidebar";
import MarketerLayoutWrapper from "@/components/marketer-layout-wrapper";

export const metadata = {
  title: "Marketer Portal | El-Moore Real Estate",
  description: "External sales agent portal for El-Moore Real Estate",
};

export default function MarketerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketerHeader />
      <MarketerSidebar />
      <MarketerLayoutWrapper>{children}</MarketerLayoutWrapper>
    </div>
  );
}
