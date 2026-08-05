"use client";

import {
  Heart,
  TrendingUp,
  FileText,
  Download,
  Calculator,
} from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import PropertyCard from "@/components/property-cards";
import { properties } from "@/lib/mockData";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";

export default function Profile() {
  const { favorites } = useFavorites();
  const favProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="container py-12 min-w-full">
      {/* Profile Header */}
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row gap-8 mb-12 w-full">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
              Investor Profile
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Julian Draxler
            </h1>
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Member Since
                </p>
                <p className="font-medium">October 2022</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Strategy
                </p>
                <p className="font-medium">Capital Preservation & Growth</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                  Tier
                </p>
                <p className="font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Elite
                  Member
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-80">
            <div className="rounded-lg border border-border p-6">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Projected Portfolio Yield
              </p>
              <p className="text-4xl font-bold tabular-nums">12.8%</p>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Target: 15.0% Annual ROI
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Favorited Properties */}
        <div className="lg:col-span-2 space-y-8">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Favorited Properties</h2>
              <span className="text-sm text-muted-foreground">View All</span>
            </div>
          </ScrollReveal>

          {favProperties.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {favProperties.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.08}>
                  <PropertyCard property={p} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="rounded-lg border border-border p-12 text-center">
                <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No favorited properties yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse the showroom and tap the heart icon to save properties
                  here.
                </p>
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
                >
                  Browse Showroom
                </Link>
              </div>
            </ScrollReveal>
          )}

          {/* Portfolio */}
          <ScrollReveal>
            <h2 className="text-xl font-bold mb-4">My Portfolio</h2>
            <div className="rounded-lg bg-card border border-gold/30 p-6 text-card-foreground flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-gold">
                  Eko Atlantic Signature
                </h3>
                <p className="text-sm opacity-80">
                  3-Bedroom Penthouse | Construction Phase: 85% Complete.
                  Expected handover Q4 2024.
                </p>
                <div className="flex gap-6 pt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">
                      Current Value
                    </p>
                    <p className="text-lg font-bold tabular-nums">₦1.2B</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">
                      Growth
                    </p>
                    <p className="text-lg font-bold text-emerald-500">+18.4%</p>
                  </div>
                </div>
              </div>
              <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
                <img
                  src={"assets/property-4.jpg"}
                  alt="Portfolio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ScrollReveal direction="right">
            <div className="rounded-lg border border-border p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Recent Projections
              </h3>
              {[
                {
                  name: "Lekki Phase 1 Commercial",
                  strategy: "15 Year Buy-to-Let Strategy",
                  value: "₦12.4M / Year",
                  time: "2D Ago",
                },
                {
                  name: "Ibeju-Lekki Land Flip",
                  strategy: "24 Month Land Banking",
                  value: "45.5% Total Return",
                  time: "1W Ago",
                },
              ].map((proj, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border p-4 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                      Projected ROI
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {proj.time}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{proj.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {proj.strategy}
                  </p>
                  <p className="text-lg font-bold tabular-nums">{proj.value}</p>
                </div>
              ))}
              <Link
                href="/calculator"
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                New Calculation <TrendingUp className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                The Vault Documents
              </p>
              {[
                {
                  name: "C of O - Lekki Property",
                  meta: "Verified • PDF (2.4MB)",
                },
                {
                  name: "Sales Agreement - Eko Atlantic",
                  meta: "Signed • PDF (1.1MB)",
                },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-border p-4"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.meta}</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground transition-colors" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
