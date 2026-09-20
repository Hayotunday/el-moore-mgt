"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  UserX,
  Mail,
  Calendar,
  Building2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import SearchFilterBar from "@/components/management/search-filter-bar";
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from "@/components/management/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { listUsers, setMarketerStatus, deactivateUser } from "@/lib/api/users";
import { listReferrals, type ReferralWithSale } from "@/lib/api/referrals";
import type { ManagementUser, MarketerStatus } from "@/lib/api/types";
import { formatCurrency, formatDate, getFullName } from "@/lib/utils";

interface MarketerWithMetrics extends ManagementUser {
  referrals: ReferralWithSale[];
  totalReferralsCount: number;
  totalSalesVolume: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export default function AffiliateMarketersPage() {
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();

  const [marketers, setMarketers] = useState<ManagementUser[]>([]);
  const [referrals, setReferrals] = useState<ReferralWithSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [selectedMarketer, setSelectedMarketer] =
    useState<MarketerWithMetrics | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersList, referralsList] = await Promise.all([
        listUsers("AFFILIATE_MARKETER"),
        listReferrals().catch(() => [] as ReferralWithSale[]),
      ]);
      setMarketers(usersList);
      setReferrals(referralsList);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load affiliate marketers.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate referrals & metrics per marketer
  const marketersWithMetrics: MarketerWithMetrics[] = useMemo(() => {
    const referralsByMarketer = new Map<string, ReferralWithSale[]>();
    for (const ref of referrals) {
      const list = referralsByMarketer.get(ref.marketerId) || [];
      list.push(ref);
      referralsByMarketer.set(ref.marketerId, list);
    }

    return marketers.map((m) => {
      const userRefs = referralsByMarketer.get(m.id) || [];
      const totalSalesVolume = userRefs.reduce(
        (sum, r) => sum + (r.saleAmount || 0),
        0,
      );
      const totalCommission = userRefs.reduce(
        (sum, r) => sum + Number(r.commissionAmount || 0),
        0,
      );
      const pendingCommission = userRefs
        .filter((r) => r.status === "PENDING")
        .reduce((sum, r) => sum + Number(r.commissionAmount || 0), 0);
      const paidCommission = userRefs
        .filter((r) => r.status === "PAID")
        .reduce((sum, r) => sum + Number(r.commissionAmount || 0), 0);

      return {
        ...m,
        referrals: userRefs,
        totalReferralsCount: userRefs.length,
        totalSalesVolume,
        totalCommission,
        pendingCommission,
        paidCommission,
      };
    });
  }, [marketers, referrals]);

  // Metrics summary
  const totalCount = marketersWithMetrics.length;
  const pendingMarketers = useMemo(
    () => marketersWithMetrics.filter((m) => (m.marketerStatus || "PENDING") === "PENDING"),
    [marketersWithMetrics],
  );
  const approvedMarketers = useMemo(
    () => marketersWithMetrics.filter((m) => m.marketerStatus === "APPROVED"),
    [marketersWithMetrics],
  );
  const totalCommissionEarned = useMemo(
    () => marketersWithMetrics.reduce((sum, m) => sum + m.totalCommission, 0),
    [marketersWithMetrics],
  );

  // Filtered marketers
  const filteredMarketers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return marketersWithMetrics.filter((m) => {
      const currentStatus = m.marketerStatus || "PENDING";
      if (activeTab === "pending" && currentStatus !== "PENDING") return false;
      if (activeTab === "all" && statusFilter !== "all" && currentStatus !== statusFilter) {
        return false;
      }
      if (q) {
        const nameMatch = getFullName(m).toLowerCase().includes(q);
        const emailMatch = m.email.toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [marketersWithMetrics, search, statusFilter, activeTab]);

  const handleUpdateStatus = async (
    marketer: MarketerWithMetrics,
    status: MarketerStatus,
  ) => {
    if (status === "REJECTED") {
      const ok = await confirm({
        title: `Reject Affiliate Marketer?`,
        description: `Are you sure you want to reject the application for ${getFullName(
          marketer,
        )}? They will not be able to log in or earn commissions until approved.`,
        confirmLabel: "Reject Application",
        destructive: true,
      });
      if (!ok) return;
    }

    setBusyId(marketer.id);
    try {
      await setMarketerStatus(marketer.id, status);
      toast.success(
        status === "APPROVED"
          ? `${getFullName(marketer)} has been approved!`
          : `${getFullName(marketer)} application was rejected.`,
      );
      await loadData();
      if (selectedMarketer?.id === marketer.id) {
        setSelectedMarketer((prev) =>
          prev ? { ...prev, marketerStatus: status } : null,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Could not update marketer status.`,
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDeactivate = async (marketer: MarketerWithMetrics) => {
    const ok = await confirm({
      title: `Deactivate ${getFullName(marketer)}?`,
      description:
        "This marketer will be deactivated and immediately prevented from accessing their portal. Their past referral history and commission records will remain intact.",
      confirmLabel: "Deactivate",
      destructive: true,
    });
    if (!ok) return;

    setBusyId(marketer.id);
    try {
      await deactivateUser(marketer.id);
      toast.success("Marketer deactivated.");
      await loadData();
      setDrawerOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not deactivate marketer.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const openMarketerDrawer = (marketer: MarketerWithMetrics) => {
    setSelectedMarketer(marketer);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Affiliate Marketers"
        subtitle="Manage registered affiliate marketers, review pending applications, and track sales commission metrics."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Marketers"
          value={loading ? "…" : totalCount}
          sublabel="Registered affiliate network"
          icon={<Handshake className="h-6 w-6" />}
        />
        <StatCard
          label="Pending Approvals"
          value={loading ? "…" : pendingMarketers.length}
          sublabel={
            pendingMarketers.length > 0
              ? "Action required"
              : "All applications reviewed"
          }
          icon={<Clock className="h-6 w-6" />}
          variant={pendingMarketers.length > 0 ? "destructive" : "default"}
        />
        <StatCard
          label="Approved Marketers"
          value={loading ? "…" : approvedMarketers.length}
          sublabel="Active affiliate partners"
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          label="Total Commissions"
          value={loading ? "…" : formatCurrency(totalCommissionEarned)}
          sublabel="Earned across all sales"
          icon={<DollarSign className="h-6 w-6" />}
          variant="gold"
        />
      </div>

      {/* Tabs & Search Filter */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "all" | "pending")}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">
              All Marketers ({marketers.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingMarketers.length > 0 && (
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {pendingMarketers.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "all" && (
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by name or email…"
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { label: "Pending", value: "PENDING" },
                    { label: "Approved", value: "APPROVED" },
                    { label: "Rejected", value: "REJECTED" },
                  ],
                },
              ]}
            />
          )}

          {activeTab === "pending" && (
            <div className="w-full sm:w-72">
              <SearchFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Filter pending applicants…"
              />
            </div>
          )}
        </div>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="m-0">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Marketer</DataTableHeadCell>
              <DataTableHeadCell>Status</DataTableHeadCell>
              <DataTableHeadCell align="center">Referrals / Sales</DataTableHeadCell>
              <DataTableHeadCell align="right">Volume Generated</DataTableHeadCell>
              <DataTableHeadCell align="right">Commissions</DataTableHeadCell>
              <DataTableHeadCell>Joined</DataTableHeadCell>
              <DataTableHeadCell align="right">Actions</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableRow index={0}>
                  <DataTableCell align="center" className="py-8 text-muted-foreground">
                    Loading affiliate marketers…
                  </DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                  <DataTableCell>{""}</DataTableCell>
                </DataTableRow>
              ) : filteredMarketers.length === 0 ? (
                <DataTableEmpty colSpan={7} />
              ) : (
                filteredMarketers.map((m, idx) => {
                  const status = m.marketerStatus || "PENDING";
                  const isBusy = busyId === m.id;

                  return (
                    <DataTableRow key={m.id} index={idx}>
                      <DataTableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                            {m.firstName?.[0]}
                            {m.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">
                              {getFullName(m)}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </DataTableCell>

                      <DataTableCell>
                        <StatusBadge status={status} />
                      </DataTableCell>

                      <DataTableCell align="center">
                        <span className="font-medium text-foreground">
                          {m.totalReferralsCount}
                        </span>
                      </DataTableCell>

                      <DataTableCell align="right">
                        <span className="font-medium text-foreground">
                          {formatCurrency(m.totalSalesVolume)}
                        </span>
                      </DataTableCell>

                      <DataTableCell align="right">
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {formatCurrency(m.totalCommission)}
                          </p>
                          {m.pendingCommission > 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                              {formatCurrency(m.pendingCommission)} pending
                            </p>
                          )}
                        </div>
                      </DataTableCell>

                      <DataTableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(m.createdAt)}
                        </span>
                      </DataTableCell>

                      <DataTableCell align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(m, "APPROVED")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-destructive hover:bg-destructive/10"
                                disabled={isBusy}
                                onClick={() => handleUpdateStatus(m, "REJECTED")}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </>
                          )}

                          {status === "REJECTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-emerald-600 hover:bg-emerald-500/10"
                              disabled={isBusy}
                              onClick={() => handleUpdateStatus(m, "APPROVED")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Re-Approve
                            </Button>
                          )}

                          <Link href={`/management/marketers/${m.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Profile
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => openMarketerDrawer(m)}
                          >
                            Drawer
                          </Button>
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>
        </TabsContent>
      </Tabs>

      {/* Marketer Performance & Detail Slide-Over Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="w-full">
          <DrawerHeader>
            <DrawerTitle>
              {selectedMarketer ? getFullName(selectedMarketer) : "Marketer Details"}
            </DrawerTitle>
            <DrawerDescription>
              Affiliate performance summary, attributed sales, and commission payout log.
            </DrawerDescription>
          </DrawerHeader>

          {selectedMarketer && (
            <DrawerBody className="space-y-6">
              {/* Profile Overview */}
              <div className="rounded-md border p-4 bg-muted/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {getFullName(selectedMarketer)}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedMarketer.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={selectedMarketer.marketerStatus || "PENDING"}
                    />
                    {!selectedMarketer.isActive && (
                      <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        Deactivated
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Referrals
                    </p>
                    <p className="text-lg font-bold text-foreground mt-0.5">
                      {selectedMarketer.totalReferralsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Sales Volume
                    </p>
                    <p className="text-lg font-bold text-foreground mt-0.5">
                      {formatCurrency(selectedMarketer.totalSalesVolume)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Commissions
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {formatCurrency(selectedMarketer.totalCommission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Pending Payout
                    </p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatCurrency(selectedMarketer.pendingCommission)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attributed Referrals & Sales List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gold" />
                    Attributed Property Sales ({selectedMarketer.referrals.length})
                  </h4>
                </div>

                {selectedMarketer.referrals.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No property sales have been closed with this marketer yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {selectedMarketer.referrals.map((ref) => (
                      <div
                        key={ref.id}
                        className="rounded-md border bg-card p-3.5 flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {ref.sale?.property?.title || "Property Sale"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Buyer: {ref.buyerName || "—"} • Sold for:{" "}
                            <span className="font-medium text-foreground">
                              {formatCurrency(ref.saleAmount)}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Date: {formatDate(ref.createdAt)}
                          </p>
                        </div>

                        <div className="text-right shrink-0 space-y-1">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(ref.commissionAmount))}
                          </p>
                          <StatusBadge status={ref.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DrawerBody>
          )}

          <DrawerFooter className="flex flex-row justify-between items-center gap-3">
            {selectedMarketer && selectedMarketer.isActive && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-1.5"
                disabled={busyId === selectedMarketer.id}
                onClick={() => handleDeactivate(selectedMarketer)}
              >
                <UserX className="h-4 w-4" />
                Deactivate Marketer
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {selectedMarketer &&
                selectedMarketer.marketerStatus === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      disabled={busyId === selectedMarketer.id}
                      onClick={() => handleUpdateStatus(selectedMarketer, "REJECTED")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={busyId === selectedMarketer.id}
                      onClick={() => handleUpdateStatus(selectedMarketer, "APPROVED")}
                    >
                      Approve Marketer
                    </Button>
                  </>
                )}
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
