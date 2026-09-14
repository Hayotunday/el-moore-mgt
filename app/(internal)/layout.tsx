import type { ReactNode } from "react";

/**
 * A pure passthrough — the (management) and (marketer) route groups nested
 * under it each mount their own AuthProvider with their own realm, so there
 * is no single "internal" session to provide at this level anymore.
 */
export default function InternalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
