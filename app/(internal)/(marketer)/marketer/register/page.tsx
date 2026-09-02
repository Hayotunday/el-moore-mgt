"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerExternalMarketer, verifyCode, resendVerification } from "@/lib/api/auth";

type Step = "form" | "verify" | "done";

export default function MarketerRegisterPage() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerExternalMarketer({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await verifyCode({ email: form.email, code });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(form.email);
      toast.success("Verification code resent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center py-16"
      style={{ background: "var(--gradient-green)" }}
    >
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_80%_20%,white,transparent_45%)]" />

      <ScrollReveal className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-md bg-white/95 backdrop-blur-xl p-8 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.5)]">
          {step === "form" && (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <UserPlus className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Become a marketer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Refer buyers, earn commission. An MD or GM reviews every application
                  before it&apos;s approved.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="At least 12 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Creating account..." : "Apply as a Marketer"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link href="/marketer" className="text-primary underline underline-offset-2">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to <span className="font-medium">{form.email}</span>.
                  Enter it below to confirm your address.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.5em]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify Email <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  {resending ? "Resending..." : "Resend code"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Email verified</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Your application is now pending review. An MD or GM will approve your
                account before you can sign in — we&apos;ll notify you by email once that
                happens.
              </p>
              <Link href="/marketer">
                <Button className="w-full" size="lg">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
