"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  ArrowRight,
  Shield,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";
import PropertyCard from "@/components/property-cards";
import { properties } from "@/lib/mockData";

export default function Lobby() {
  const [strategy, setStrategy] = useState<"Buy-to-Sell" | "Buy-to-Let">(
    "Buy-to-Sell",
  );
  const [location, setLocation] = useState("");

  const featured = properties.slice(0, 2);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-150 w-full flex items-end overflow-hidden">
        <img
          src={"assets/hero-bg.jpg"}
          alt="Luxury property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/40 to-transparent" />
        <div className="container relative z-10 md:pl-10 pb-16 space-y-8">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-primary-foreground leading-[1.05]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Build Your Wealth with
            <br />
            <span className="text-gold">El-Moore Real Estate</span>
          </motion.h1>

          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 bg-card rounded-lg overflow-hidden shadow-xl max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-border">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 block">
                Location
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g., Gwarinpa, Abuja"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="p-4 flex md:flex-col items-center justify-start gap-2">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mr-2 whitespace-nowrap">
                Investment Strategy
              </label>
              <div className="flex gap-1">
                {(["Buy-to-Sell", "Buy-to-Let"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      strategy === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/listings"
              className="bg-primary text-primary-foreground px-6 py-4 text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.97]"
            >
              Find Opportunities
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Showroom */}
      <section className="container py-20">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                Investment Curations
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                Featured Showroom
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              View All Portfolio
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScrollReveal className="lg:col-span-2">
            <PropertyCard property={properties[0]} />
          </ScrollReveal>
          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <div className="rounded-lg border border-border p-6 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  The Vault
                </p>
                <h3 className="text-lg font-bold">
                  Secure Your Titles with Our Private Digital Vault
                </h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted storage for C of O, Governor's Consent, and Survey
                  plans. Accessible globally, anytime.
                </p>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground hover:text-muted-foreground"
                >
                  Access My Vault <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="rounded-lg bg-gold p-6 text-secondary-foreground space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/70 font-semibold">
                  Calculated Growth
                </p>
                <h3 className="text-lg font-bold">ROI Forecasting Tool</h3>
                <p className="text-sm opacity-80">
                  Predict your wealth trajectory based on 10-year market data
                  trends in Abuja and Lagos.
                </p>
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-background/10 border border-background/20 px-4 py-2 rounded hover:bg-background/20 transition-colors"
                >
                  Calculate Now
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Academy Teaser */}
      <section className="">
        <div className="container py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg overflow-hidden aspect-3/4">
                  <img
                    src={"assets/property-1.jpg"}
                    alt="Academy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-card p-4 text-card-foreground">
                    <p className="text-xs font-bold">Legal Masterclass</p>
                    <p className="text-xs opacity-70 mt-1">
                      Understanding Land Use Act implications for HNWIs.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden aspect-square">
                    <img
                      src={"assets/property-3.jpg"}
                      alt="Academy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                El-Moore Academy
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 italic">
                The Investor's Intelligence Bureau
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Knowledge is the bedrock of sustainable wealth. Our academy
                provides curated insights, legal frameworks, and market
                forecasts that the standard property portals simply don't have
                access to.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Strategic Whitepapers
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Deep-dive into regional development plans and
                      infrastructure pivots.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Private Webinars</h4>
                    <p className="text-sm text-muted-foreground">
                      Monthly sessions with financial analysts and top-tier real
                      estate legal experts.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-foreground rounded-md px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-secondary-foreground transition-colors active:scale-[0.97]"
              >
                Enter the Academy
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
