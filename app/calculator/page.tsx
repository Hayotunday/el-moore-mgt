"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { TrendingUp, Download, Shield, Home } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/scroll-reveal";

const holdOptions = [1, 3, 5, 7, 10];
const ANNUAL_RATE = 0.15;

function CalculatorContent() {
  const searchParams = useSearchParams();
  const initialPrice = searchParams.get("price")
    ? parseInt(searchParams.get("price")!)
    : 75000000;
  const [price, setPrice] = useState(initialPrice);
  const [holdYears, setHoldYears] = useState(5);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const result = useMemo(() => {
    const futureValue = price * Math.pow(1 + ANNUAL_RATE, holdYears);
    const profit = futureValue - price;
    const roiPercent = ((futureValue - price) / price) * 100;
    const chartData = Array.from({ length: holdYears }, (_, i) => ({
      year: `Year ${i + 1}`,
      value: Math.round(price * Math.pow(1 + ANNUAL_RATE, i + 1)),
    }));
    return { futureValue, profit, roiPercent, chartData };
  }, [price, holdYears]);

  const formatNGN = (n: number) => "₦" + n.toLocaleString();

  return (
    <div className="container py-12 min-w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Inputs */}
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Premium Analysis
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Investment
            <br />
            Growth Predictor
          </h1>
          <p className="text-muted-foreground mb-10 max-w-md">
            Calculate the compounded authority of your real estate portfolio.
            Our model assumes a conservative 15% annual appreciation rate based
            on regional historical data.
          </p>

          <div className="rounded-lg border border-border p-6 space-y-8">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Purchase Price (NGN)
              </label>
              <div className="flex items-center border border-border rounded-md px-4 py-3">
                <span className="text-muted-foreground mr-2">₦</span>
                <input
                  type="text"
                  value={price.toLocaleString()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/[^0-9]/g, ""));
                    if (!isNaN(val)) setPrice(val);
                  }}
                  className="bg-transparent text-lg font-medium focus:outline-none w-full tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                Hold Duration (Years)
              </label>
              <div className="flex gap-2">
                {holdOptions.map((y) => (
                  <button
                    key={y}
                    onClick={() => setHoldYears(y)}
                    className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      holdYears === y
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-muted"
                    } active:scale-95`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gold font-semibold">
                Annual Appreciation Rate
              </span>
              <span className="text-muted-foreground">15% Fixed</span>
            </div>
          </div>

          <div className="border-l-4 border-gold p-6 flex-1 mt-5 bg-card text-card-foreground">
            <p className="italic">
              "Real estate is the only asset class where time literally
              manufacture wealth"
            </p>
          </div>
        </ScrollReveal>

        {/* Right: Results */}
        <ScrollReveal direction="right">
          <div className="bg-card rounded-xl p-8 text-card-foreground">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">
                  Estimated ROI
                </p>
                <motion.p
                  key={result.roiPercent}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-bold tabular-nums"
                >
                  {result.roiPercent.toFixed(1)}%
                </motion.p>
                <p className="text-sm opacity-70 mt-1">
                  Yield after {holdYears} years
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">
                  Total Projected Profit
                </p>
                <motion.p
                  key={result.profit}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold tabular-nums"
                >
                  {formatNGN(Math.round(result.profit))}
                </motion.p>
                <p className="text-sm opacity-70 mt-1">
                  Valuation: {formatNGN(Math.round(result.futureValue))}
                </p>
              </div>
            </div>

            <div className="h-48 mb-6">
              {isClient && (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                  <BarChart data={result.chartData}>
                    <XAxis
                      dataKey="year"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) => {
                        if (typeof value === "number") {
                          return formatNGN(value);
                        }
                        return value;
                      }}
                      contentStyle={{
                        background: "hsl(156,33%,12%)",
                        border: "none",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(44,33%,67%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-background/10 
                            border border-background/20 rounded-md py-3 text-sm font-medium 
                            hover:bg-background/20 transition-colors active:scale-[0.97]"
              >
                <TrendingUp className="h-4 w-4" /> Find Properties with this ROI
              </button>
              <button
                className="flex items-center gap-2 bg-background/10 border 
                            border-background/20 rounded-md px-4 py-3 text-sm 
                            font-medium hover:bg-background/20 transition-colors 
                            active:scale-[0.97]"
              >
                <Download className="h-4 w-4" /> Download Full Analysis
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Bottom Stats */}
      <ScrollReveal className="mt-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              label: "Tax Efficiency",
              value: "₦4.2M Saved",
              desc: "Projected savings through corporate structuring.",
            },
            {
              icon: Home,
              label: "Rental Potential",
              value: "8.5% p.a.",
              desc: "Additional yield via annual short-let tenancy.",
            },
            {
              icon: TrendingUp,
              label: "Risk Rating",
              value: "Low Volatility",
              desc: "Asset backed by Grade-A architectural land titles.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-6 space-y-2"
            >
              <p className="text-xs text-gold font-semibold">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

export default function Calculator() {
  return (
    <Suspense>
      <CalculatorContent />
    </Suspense>
  );
}
