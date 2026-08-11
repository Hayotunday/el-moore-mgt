import { Award, CheckCircle } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/scroll-reveal";
import { teamMembers } from "@/lib/mockData";

export default function AboutUs() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Our Philosophy
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] mb-6">
              Building Wealth Through{" "}
              <em className="font-bold italic">Curated</em> Real Estate
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              We don't just broker land; we curate portfolios. El-Moore is a
              sanctuary for high-net-worth individuals seeking the intersection
              of architectural heritage and financial precision.
            </p>
            <div className="flex gap-3">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]">
                Download Prospectus
              </button>
              <button className="border border-foreground px-6 py-3 rounded-md text-sm font-medium hover:bg-muted transition-colors active:scale-[0.97]">
                View Our Portfolio
              </button>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="rounded-xl overflow-hidden aspect-4/3">
              <img
                src={"assets/identity-hero.jpg"}
                alt="El-Moore HQ"
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Heritage */}
      <section className="container py-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-1">Our Heritage</h2>
          <div className="w-16 h-0.5 bg-gold mb-12" />
        </ScrollReveal>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="rounded-lg border border-border p-8 space-y-4">
              <h3 className="text-xl font-bold">
                A Legacy of Discrete Excellence
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Founded on the principles of private banking, El-Moore Real
                Estate began as a bespoke family office. Over two decades, we
                transitioned into a public-facing authority, yet our core DNA
                remains focused on confidentiality, asset protection, and
                multi-generational wealth creation.
              </p>
              <div className="flex gap-8 pt-4">
                {[
                  { value: "24+", label: "Years of Experience" },
                  { value: "₦450B", label: "Assets Under Advisory" },
                  { value: "1.2k", label: "Curated Estates" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="rounded-xl overflow-hidden aspect-4/3">
              <img
                src={"assets/property-1.jpg"}
                alt="Heritage"
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team */}
      <section className="container py-20">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-2">The Curators</h2>
          <p className="text-sm text-muted-foreground mb-10 max-w-lg">
            Our leadership team comprises economists, architects, and legal
            experts dedicated to the meticulous selection of every square meter
            in our catalog.
          </p>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <ScrollReveal key={member.name} delay={i * 0.08}>
              <div className="group">
                <div className="aspect-square rounded-lg bg-muted mb-4 overflow-hidden flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gold text-secondary-foreground flex items-center justify-center text-2xl font-bold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="container py-12">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-t border-b border-border py-8">
            <div>
              <h3 className="font-bold text-lg mb-1">Certified Authority</h3>
              <p className="text-sm text-muted-foreground">
                We maintain the highest global standards for financial reporting
                and property valuation.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                "REBNY Member",
                "ISO 9001:2015",
                "EFCC Compliant",
                "RICS Accredited",
              ].map((cert) => (
                <span
                  key={cert}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-gold" /> {cert}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="bg-gradient-green">
        <div className="container py-20 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-4 text-white">
              Experience Personal Concierge Investment
            </h2>
            <p className="text-white/75 mb-8 max-w-md mx-auto">
              Every story at El-Moore begins with a conversation. Let us curate
              your next high-yield acquisition with the discretion you deserve.
            </p>
            <Link
              href="/helpdesk"
              className="inline-flex items-center bg-gold text-secondary-foreground px-8 py-4 rounded-md font-semibold hover:bg-gold/90 transition-colors active:scale-[0.97]"
            >
              Request Private Consultation
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
