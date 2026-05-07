"use client";

import { useAuth, type UserRole } from "@/contexts/auth-context";
import { ReactNode } from "react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RoleGuard({
  allowedRoles,
  children,
  fallback,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      fallback || (
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">
            Please log in to access this page.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      )
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">
            You do not have permission to access this page. Current role:{" "}
            <strong>{user.role}</strong>
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      )
    );
  }

  return <>{children}</>;
}
