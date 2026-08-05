"use client";

import { useState, useMemo } from "react";
import { properties } from "@/lib/mockData";
import PropertyCard from "@/components/property-cards";
import ScrollReveal from "@/components/scroll-reveal";
import { ArrowRight } from "lucide-react";

const locations = [
  "Abuja - Central",
  "Abuja - Asokoro",
  "Abuja - Guzape",
  "Abuja - Gwarinpa",
  "Abuja - Jabi",
  "Abuja - Katampe",
  "Abuja - Lokogoma",
  "Abuja - Lugbe",
  "Abuja - Maitama",
  "Abuja - Wuse",
  "Lagos - Ikoyi",
];
const propertyTypes = ["Land", "Terrace", "Duplex", "Flat"] as const;

export default function Listings() {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Abuja - Central",
  ]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(500000000);

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (selectedLocations.length && !selectedLocations.includes(p.district))
        return false;
      if (selectedTypes.length && !selectedTypes.includes(p.type)) return false;
      if (p.price > priceRange) return false;
      return true;
    });
  }, [selectedLocations, selectedTypes, priceRange]);

  return (
    <div className="container py-12">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Explore Investment Opportunities
        </h1>
        <p className="text-muted-foreground max-w-xl mb-10">
          Curated high-yield real estate assets tailored for sophisticated
          portfolios. Secure your future in West Africa's most resilient
          markets.
        </p>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <ScrollReveal direction="left" className="lg:w-64 shrink-0">
          <div className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
                Location
              </h3>
              <div className="space-y-2">
                {locations.map((loc) => (
                  <label
                    key={loc}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Price Range
                </h3>
                <span className="text-xs text-muted-foreground">USD</span>
              </div>
              <input
                type="range"
                min={1500000}
                max={500000000}
                step={1000000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₦1.5M</span>
                <span>₦500M+</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
                Property Type
              </h3>
              <div className="space-y-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedTypes.includes(type)
                        ? "bg-gold/20 font-medium text-gold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="flex-1 pl-10 lg:pl-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              assets available for investment
            </p>
            <span className="text-xs text-muted-foreground">
              Sort by:{" "}
              <span className="font-medium text-foreground">ROI Yield</span>
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map((property, i) => (
              <ScrollReveal key={property.id} delay={i * 0.08}>
                <PropertyCard property={property} />
              </ScrollReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium mb-2">
                No properties match your filters
              </p>
              <p className="text-sm">
                Try adjusting your location or price range criteria.
              </p>
            </div>
          )}

          <ScrollReveal className="text-center mt-12">
            <button className="inline-flex items-center gap-2 border border-foreground rounded-md px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-secondary-foreground hover:border-gold transition-colors active:scale-[0.97]">
              Discover More Assets <ArrowRight className="h-4 w-4" />
            </button>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
