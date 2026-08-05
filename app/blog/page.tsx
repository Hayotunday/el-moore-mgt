"use client";

import { useState } from "react";
import { ArrowRight, Clock, BookOpen, Scale, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";
import { articles } from "@/lib/mockData";

export default function Blog() {
  const [email, setEmail] = useState("");

  return (
    <div>
      {/* Featured Insight */}
      <section className="container py-12">
        <ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 items-center bg-card text-card-foreground rounded-xl overflow-hidden">
            <div className="relative aspect-4/3">
              <span
                className="absolute top-4 left-4 z-10 bg-gold text-secondary-foreground px-3 py-1 
              text-[10px] font-bold uppercase tracking-wider rounded"
              >
                Featured Insight
              </span>
              <img
                src={"assets/property-1.jpg"}
                alt="Featured"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Investment Mastery
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                The Future of Residential Curated Spaces
              </h2>
              <p className="text-muted-foreground text-sm">
                An executive summary on how bespoke architectural integrity is
                driving unprecedented ROI in emerging suburban districts.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-gold text-secondary-foreground 
                    flex items-center justify-center text-xs font-bold"
                  >
                    EM
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Julian Moore</p>
                    <p className="text-[10px] text-muted-foreground">
                      Chief Investment Officer
                    </p>
                  </div>
                </div>
                <button
                  className="ml-auto inline-flex items-center gap-2 bg-primary 
                  text-primary-foreground px-4 py-2 rounded text-xs font-bold uppercase 
                  tracking-wider hover:bg-primary/90 transition-colors active:scale-[0.97]"
                >
                  Read Article <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Market Insights */}
      <section className="container py-12">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Market Insights</h2>
              <p className="text-sm text-muted-foreground">
                Navigating global trends and local opportunities.
              </p>
            </div>
            <button
              className="text-sm font-medium text-foreground flex items-center 
            gap-1 hover:text-muted-foreground transition-colors"
            >
              View All Category <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ScrollReveal key={article.id} delay={i * 0.08}>
              <div className="group cursor-pointer">
                <div className="aspect-3/2 rounded-lg overflow-hidden mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="uppercase tracking-wider font-semibold">
                    {article.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {article.excerpt}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Legal Masterclass */}
      <section className="">
        <div className="container py-16">
          <ScrollReveal>
            <h2 className="text-2xl font-bold italic mb-1">
              Legal Masterclass
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Asset protection and regulatory frameworks.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="flex gap-6 bg-card text-card-foreground rounded-lg p-6 border border-border">
                <div className="w-24 h-32 rounded bg-muted shrink-0 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-gold font-bold">
                    Advanced Module
                  </span>
                  <h3 className="font-bold">
                    Tax Structuring for International Assets
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive guide to legally optimizing your tax
                    exposure across multi-jurisdictional property holdings.
                  </p>
                  <p className="text-xs text-gold font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 15 min read
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <div className="space-y-4">
              <ScrollReveal delay={0.1}>
                <div className="bg-card text-card-foreground rounded-lg p-5 border border-border flex items-start gap-3">
                  <Scale className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Understanding "Certificate of Occupancy"
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      The vital document every Nigerian land investor must
                      master.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 6 min read
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="bg-card text-card-foreground rounded-lg p-5 border border-border flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      Smart Contracts in Real Estate
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      How blockchain is revolutionizing title deeds and escrow.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 7 min read
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container py-20">
        <ScrollReveal>
          <div className="bg-card text-card-foreground rounded-xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold italic mb-1">
                The Curator's Digest
              </h2>
              <p className="text-sm text-muted-foreground">
                Join 5,000+ elite investors who receive our bi-weekly
                architectural and financial analysis directly in their vault.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="professional@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-border rounded-md px-4 py-2.5 text-sm bg-background flex-1 md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-gold text-secondary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.97] whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function Shield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
