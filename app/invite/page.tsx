"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyInviteToken, acceptInvite } from "@/lib/api/invites";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Invite } from "@/lib/api/types";

export default function InviteClaimPage() {
  return (
    <Suspense fallback={null}>
      <InviteClaimContent />
    </Suspense>
  );
}

function InviteClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<Invite | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifyError("This invite link is missing its token.");
      setVerifying(false);
      return;
    }
    verifyInviteToken(token)
      .then(setInvite)
      .catch((err) =>
        setVerifyError(err instanceof Error ? err.message : "This invite link is invalid or expired."),
      )
      .finally(() => setVerifying(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await acceptInvite({ token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not accept this invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-16"
      style={{ background: "var(--gradient-green)" }}
    >
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_80%_20%,white,transparent_45%)]" />

      <ScrollReveal className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-md bg-white/95 backdrop-blur-xl p-8 shadow-ambient-lg">
          {verifying && (
            <p className="text-sm text-muted-foreground text-center py-8">Checking your invite…</p>
          )}

          {!verifying && verifyError && (
            <div className="text-center py-4">
              <h1 className="text-2xl font-bold text-foreground mb-2">Invite not valid</h1>
              <p className="text-sm text-muted-foreground mb-6">{verifyError}</p>
              <Link href="/management">
                <Button className="w-full" size="lg">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}

          {!verifying && !verifyError && invite && !done && (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Set your password</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {invite.name} · {invite.email} · joining as{" "}
                  <span className="font-medium text-foreground">{ROLE_LABELS[invite.role]}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 12 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create Account <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {done && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Account created</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your account is ready. Sign in with your email and the password you just set.
              </p>
              <Button className="w-full" size="lg" onClick={() => router.push("/management")}>
                Go to Sign In
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
