import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

/**
 * Everything under /management and /marketer shares one "internal" auth session,
 * kept separate from the public storefront's session (see AuthProvider/AuthRealm).
 * This shadows the root layout's storefront-scoped AuthProvider for this subtree.
 */
export default function InternalLayout({ children }: { children: ReactNode }) {
  return <AuthProvider realm="internal">{children}</AuthProvider>;
}
