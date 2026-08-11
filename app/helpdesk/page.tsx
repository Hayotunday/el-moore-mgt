"use client";

import { useState } from "react";
import { MessageSquare, MapPin, Phone, Mail, Clock } from "lucide-react";
import ScrollReveal from "@/components/scroll-reveal";

export default function Helpdesk() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    interest: "Buy-to-Let Assets",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="container py-12">
      <ScrollReveal>
        <p className="text-[10px] uppercase tracking-widest text-gold font-semibold mb-2">
          Concierge & Support
        </p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-12 max-w-2xl">
          Personalized support for your{" "}
          <span className="text-gold italic">investment journey.</span>
        </h1>
      </ScrollReveal>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: Contact Form */}
        <div className="space-y-8">
          <ScrollReveal>
            <div className="rounded-lg border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Immediate Assistance</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with our senior investment consultants via WhatsApp
                  for real-time portfolio inquiries.
                </p>
              </div>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors active:scale-[0.97] whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="rounded-lg border border-border p-6 space-y-5">
              <h3 className="font-bold text-lg">Send an Email Inquiry</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Johnathan Moore"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 block">
                    Investment Interest
                  </label>
                  <select
                    value={form.interest}
                    onChange={(e) => update("interest", e.target.value)}
                    className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option>Buy-to-Let Assets</option>
                    <option>Buy-to-Sell Assets</option>
                    <option>Land Banking</option>
                    <option>Joint Venture</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="investor@domain.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 block">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Details regarding your inquiry..."
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors active:scale-[0.97]">
                Submit Inquiry
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Right: Map + Contact Info */}
        <div className="space-y-8">
          <ScrollReveal direction="right">
            <div className="rounded-xl overflow-hidden bg-muted aspect-4/3 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.0!2d7.49!3d9.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDMnMDAuMCJOIDfCsDI5JzI0LjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="absolute inset-0"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Headquarters</p>
                  <p className="text-xs text-muted-foreground">
                    Plot 1242, El-Moore Plaza, Central Business District, Abuja.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                  Global Reach
                </p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +234 (0) 800 ELMOORE
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> concierge@elmoore.com
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Business Hours
                </p>
                <div className="flex gap-12 text-sm">
                  <div>
                    <p className="font-medium">Weekdays</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 08:00 AM — 06:00 PM
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Weekends</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 10:00 AM — 04:00 PM
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                El-Moore Real Estate is a registered brokerage under the
                Nigerian Investment Promotion Commission. All investment
                consultations are private and strictly by appointment.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
