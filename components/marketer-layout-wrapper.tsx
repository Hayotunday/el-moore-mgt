"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function MarketerLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/marketer/register";

  if (isRegisterPage) {
    return <>{children}</>;
  }

  return (
    <main className="flex-1 transition-all duration-300 lg:ml-16">
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
    </main>
  );
}
