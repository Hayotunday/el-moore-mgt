"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Share2, Wallet, LineChart, ArrowRight, Lock } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

const pillars = [
  {
    icon: Share2,
    title: "One link, every referral",
    body: "Share your personal link — every property inspection and sale it leads to is credited back to you automatically.",
  },
  {
    icon: Wallet,
    title: "Commission you can track",
    body: "See exactly what's pending and what's been paid, referral by referral, with no back-and-forth needed.",
  },
  {
    icon: LineChart,
    title: "Built for external partners",
    body: "A dedicated portal for marketers outside El-Moore — separate from internal staff tools, scoped to what matters to you.",
  },
];

export default function MarketerLandingPage() {
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
      router.push("/marketer/overview");
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
        {/* Editorial write-up */}
        <ScrollReveal direction="left" className="text-white">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-4">
            El-Moore Marketer Portal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.08] mb-6">
            Earn commission on
            <br />
            <span className="text-gold italic">every referral that closes.</span>
          </h1>
          <p className="text-white/75 max-w-lg mb-10">
            Bring us buyers, share your link, and let us handle the rest —
            listings, paperwork, and payment. This is where you track it all.
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
                  <h3 className="font-semibold text-sm text-white">{pillar.title}</h3>
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
              <h2 className="text-2xl font-bold text-foreground">Sign in to your portal</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Not a marketer yet?{" "}
                <Link href="/marketer/register" className="underline underline-offset-2">
                  Apply here
                </Link>
                . El-Moore staff should use the{" "}
                <Link href="/management" className="underline underline-offset-2">
                  management portal
                </Link>
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
                  placeholder="you@example.com"
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

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
