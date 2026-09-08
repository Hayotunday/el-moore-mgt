"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Share2, Wallet, CheckCircle2, Clock, Copy, ArrowRight } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { listMyReferrals } from "@/lib/api/referrals";
import { buildReferralLink } from "@/lib/referral";
import type { Referral } from "@/lib/api/types";
import { formatCurrency, formatDate, getShortName } from "@/lib/utils";

export default function MarketerOverviewPage() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReferrals(await listMyReferrals());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load your referrals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { pendingTotal, paidTotal, pendingCount } = useMemo(() => {
    let pendingTotal = 0;
    let paidTotal = 0;
    let pendingCount = 0;
    for (const r of referrals) {
      const amount = Number(r.commissionAmount);
      if (r.status === "PAID") paidTotal += amount;
      else {
        pendingTotal += amount;
        pendingCount += 1;
      }
    }
    return { pendingTotal, paidTotal, pendingCount };
  }, [referrals]);

  const referralLink = user ? buildReferralLink(user.id) : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  const recent = referrals.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="El-Moore Marketer"
        title={`Welcome back, ${user ? getShortName(user) || "there" : "there"}`}
        subtitle="Here's how your referrals are performing."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Referrals"
          value={loading ? "…" : referrals.length}
          icon={<Share2 className="h-6 w-6" />}
        />
        <StatCard
          label="Pending Commission"
          value={loading ? "…" : formatCurrency(pendingTotal)}
          sublabel={`${pendingCount} awaiting payout`}
          icon={<Clock className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          label="Paid Commission"
          value={loading ? "…" : formatCurrency(paidTotal)}
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Total Earned"
          value={loading ? "…" : formatCurrency(pendingTotal + paidTotal)}
          sublabel="Lifetime"
          icon={<Wallet className="h-6 w-6" />}
        />
      </div>

      <div className="rounded-md bg-card p-6 shadow-ambient space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Referral Link</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share this with prospective buyers — it remembers that you referred them.
            Until that&apos;s wired up to billing automatically, introduce yourself to our
            team when a referral is ready to buy so your commission gets attributed
            correctly.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 truncate rounded-sm bg-muted/50 px-4 py-3 text-sm font-mono text-foreground">
            {referralLink || "—"}
          </div>
          <Button onClick={handleCopy} disabled={!referralLink}>
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>
      </div>

      <div className="rounded-md bg-card p-6 shadow-ambient">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Referrals</h2>
          <Link
            href="/marketer/referrals"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {!loading && recent.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No referrals yet — share your link to get started.
            </p>
          )}
          {recent.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-sm bg-muted/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {r.sale?.property?.title ?? `Sale ${r.saleId}`}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-gold">
                  {formatCurrency(r.commissionAmount)}
                </span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
