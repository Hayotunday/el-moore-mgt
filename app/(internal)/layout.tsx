import type { ReactNode } from "react";

/**
 * The root layout already provides the "internal" realm AuthProvider for this
 * whole app (there's no storefront sibling here anymore to shadow), so this
 * layout is a pure passthrough — kept only because the (management)/(marketer)
 * route groups nest under it.
 */
export default function InternalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
