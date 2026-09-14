import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";

/** Everything under /management gets its own "management" session, kept
 *  independent of a marketer's session under /marketer in the same browser. */
export default function ManagementLayout({ children }: { children: ReactNode }) {
  return <AuthProvider realm="management">{children}</AuthProvider>;
}
