"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Play,
  Calculator,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";
import { properties } from "@/lib/mockData";

export default function PropertyPage() {
  const params = useParams();
  const id = params?.id as string;
  const property = properties.find((p) => p.id.toString() === id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!property) {
    return (
      <div className="container min-h-[50vh] flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Link
          href="/listings"
          className="text-primary underline underline-offset-4"
        >
          Return to Showroom
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, you would submit formData to an API here
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full bg-muted overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Navigation */}
        <div className="absolute top-8 left-0 w-full container z-10">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-black/30"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Showroom
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/90 via-black/50 to-transparent pt-32 pb-12">
          <div className="container text-white">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-2 text-gold text-xs font-bold uppercase tracking-widest">
                <span>{property.type}</span>
                <span>•</span>
                <span>{property.location.split(",")[0]}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
                {property.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-2 opacity-90">
                  <MapPin className="h-4 w-4 text-white/80" />
                  <span>{property.location}</span>
                </div>
                <div className="px-3 py-1 border border-white/30 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-emerald-300">
                  +{property.roiPercent}% Projected ROI
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="container py-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Property Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              {property.description}
              <br />
              <br />
              This asset represents a pinnacle of architectural excellence
              within the region. Designed for the modern investor, it combines
              luxury living standards with robust capital appreciation
              potential. All titles are verified and securely held within our
              digital vault infrastructure.
            </p>
          </ScrollReveal>

          {/* Video Tour Placeholder */}
          <ScrollReveal delay={0.1}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 fill-current" /> Cinematic Tour
            </h3>
            <div className="aspect-video bg-muted rounded-xl relative overflow-hidden group cursor-pointer border border-border shadow-sm">
              <img
                src={property.image}
                alt="Video Thumbnail"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium">
                02:14
              </div>
            </div>
          </ScrollReveal>

          {/* Calculator Link */}
          <ScrollReveal delay={0.2}>
            <div className="bg-card border border-gold/20 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" /> Wealth Projection
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Calculate the compounded value of this specific property over
                  5-10 years using our proprietary market data.
                </p>
              </div>
              <Link
                href={`/calculator?price=${property.price}`}
                className="bg-gold text-secondary-foreground px-6 py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors whitespace-nowrap flex items-center gap-2 active:scale-[0.97]"
              >
                <Calculator className="h-4 w-4" /> Calculate Potential
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Sidebar - Inspection Form */}
        <div className="space-y-8">
          <ScrollReveal direction="left" delay={0.2}>
            <div className="rounded-xl border border-border p-6 shadow-sm sticky top-24 bg-card">
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                  Listing Value
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    ₦{property.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Calendar className="h-4 w-4 text-gold" /> Request
                    Inspection
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                        Full Name
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full bg-muted/30 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Julian Draxler"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        className="w-full bg-muted/30 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        placeholder="julian@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                          Date
                        </label>
                        <input
                          required
                          type="date"
                          className="w-full bg-muted/30 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                          Time
                        </label>
                        <input
                          required
                          type="time"
                          min="09:00"
                          max="16:00"
                          className="w-full bg-muted/30 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 border border-gold/20 rounded-md p-3 flex items-start gap-3 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                    <div>
                      <span className="font-bold text-foreground block mb-0.5">
                        Availability
                      </span>
                      Inspections are available Mon - Fri between 09:00 AM and
                      04:00 PM.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gold text-secondary-foreground py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-colors active:scale-[0.98]"
                  >
                    Confirm Appointment
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">
                    Request Received
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Our concierge team has received your request and will send a
                    calendar invite to your email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80"
                  >
                    Schedule another
                  </button>
                </motion.div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
