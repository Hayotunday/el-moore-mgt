import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

/** Everything under /marketer gets its own "marketer" session, kept
 *  independent of a staff member's session under /management in the same browser. */
export default function MarketerLayout({ children }: { children: ReactNode }) {
  return <AuthProvider realm="marketer">{children}</AuthProvider>;
}
