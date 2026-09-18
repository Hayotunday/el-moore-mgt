"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Users, ArrowRight, Lock } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

const pillars = [
  {
    icon: ShieldCheck,
    title: "One system of record",
    body: "Properties, sales, referrals and finance in a single source of truth — no more reconciling spreadsheets and WhatsApp threads.",
  },
  {
    icon: TrendingUp,
    title: "Built around the sale",
    body: "Every commission, income entry and payment reminder traces back to the sale that generated it.",
  },
  {
    icon: Users,
    title: "Access that fits the role",
    body: "Each teammate signs in and sees exactly the desks their role covers — nothing more, nothing hidden.",
  },
];

export default function ManagementLandingPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/management/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "var(--gradient-green)" }}
    >
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />

      <div className="container relative z-10 grid min-h-screen items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* Editorial write-up — only shown where it can sit beside the form, not stacked above it */}
        <ScrollReveal direction="left" className="hidden text-white lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-4">
            El-Moore Management
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.08] mb-6">
            The operating desk behind
            <br />
            <span className="text-gold italic">every El-Moore sale.</span>
          </h1>
          <p className="text-white/75 max-w-lg mb-10">
            This is where listings become sales, sales become commissions, and
            commissions become trust. Built for the coordinators, accountants
            and marketers who keep El-Moore Real Estate running — one login, one
            dashboard, tailored to what your role actually needs to see.
          </p>

          <div className="grid gap-6 sm:grid-cols-1 max-w-lg">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.15 + i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-start gap-4 rounded-md bg-white/5 border border-white/10 p-5"
              >
                <pillar.icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-white/65 mt-1">{pillar.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Login card */}
        <ScrollReveal direction="right">
          <div className="relative mx-auto w-full max-w-md rounded-md bg-white/95 backdrop-blur-xl p-8 shadow-ambient-lg">
            <div className="mb-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Sign in to Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Internal access only. Marketers should use the{" "}
                <a href="/marketer" className="underline underline-offset-2">
                  marketer portal
                </a>
                .
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@elmoore.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
