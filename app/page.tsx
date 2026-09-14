"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Share2, ShieldCheck } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { getStoredToken } from "@/lib/api/client";

const portals = [
  {
    href: "/management",
    icon: ShieldCheck,
    eyebrow: "Internal Staff",
    title: "Management",
    body: "Properties, sales, finance, HR and every other desk that keeps El-Moore Real Estate running.",
  },
  {
    href: "/marketer",
    icon: Share2,
    eyebrow: "External Partners",
    title: "Marketer Portal",
    body: "Track your referral link, see commissions as they're earned, and follow every sale it leads to.",
  },
];

export default function PortalChooserPage() {
  const router = useRouter();
  // Not rendered until we've confirmed there's no existing session to redirect
  // into — otherwise a signed-in user would see the chooser flash before being
  // bounced to their dashboard.
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    if (getStoredToken("management")) {
      router.replace("/management/overview");
      return;
    }
    if (getStoredToken("marketer")) {
      router.replace("/marketer/overview");
      return;
    }
    setCheckedSession(true);
  }, [router]);

  if (!checkedSession) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center"
        style={{ background: "var(--gradient-green)" }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-16"
      style={{ background: "var(--gradient-green)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white,transparent_45%)] opacity-[0.06]" />

      <ScrollReveal className="relative z-10 mb-12 text-center">
        <p className="mb-3 text-[10px] font-semibold tracking-widest text-gold uppercase">
          El-Moore Staff Portal
        </p>
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          Where would you like to go?
        </h1>
      </ScrollReveal>

      <div className="relative z-10 grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {portals.map((portal, i) => (
          <motion.div
            key={portal.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={portal.href}
              className="group flex h-full flex-col rounded-md border border-white/10 bg-white/5 p-8 shadow-ambient-lg transition-colors hover:bg-white/10"
            >
              <portal.icon className="mb-6 h-7 w-7 text-gold" />
              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-white/50 uppercase">
                {portal.eyebrow}
              </p>
              <h2 className="mb-2 text-xl font-bold text-white">{portal.title}</h2>
              <p className="mb-8 flex-1 text-sm text-white/65">{portal.body}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
                Continue{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
