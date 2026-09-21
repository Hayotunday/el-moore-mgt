"use client";

import { Suspense, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Wallet, Plus, Search, UserCheck, UserPlus, X, Eye } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import {
  getSalesDashboard,
  listOverdueSales,
  addInstallmentPayment,
  createSale,
  voidSale,
  type DashboardSale,
} from "@/lib/api/sales";
import { listProperties } from "@/lib/api/properties";
import { listUsers } from "@/lib/api/users";
import { listCustomers, createCustomer } from "@/lib/api/customers";
import type { ManagementUser, Property, Customer } from "@/lib/api/types";
import { formatCurrency, formatDate, getFullName } from "@/lib/utils";

const EMPTY_SALE_FORM = {
  propertyId: "",
  buyerMode: "existing" as "existing" | "new",
  selectedCustomerId: "",
  buyerFirstName: "",
  buyerMiddleName: "",
  buyerLastName: "",
  buyerPhone: "",
  buyerEmail: "",
  saleType: "OUTRIGHT" as "OUTRIGHT" | "INSTALLMENT",
  totalAmount: "",
  marketerId: "",
};

function buyerDisplayName(sale: DashboardSale): string {
  const split = getFullName({
    firstName: sale.firstName,
    middleName: null,
    lastName: sale.lastName,
  });
  return split || "—";
}

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesPageContent />
    </Suspense>
  );
}

function SalesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "outright" ? "outright" : tabParam === "installment" ? "installment" : "all";

  const [tab, setTab] = useState<"all" | "installment" | "outright">(initialTab);
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState<DashboardSale[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [staff, setStaff] = useState<ManagementUser[]>([]);
  const [approvedMarketers, setApprovedMarketers] = useState<ManagementUser[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const customerSearchRef = useRef<HTMLInputElement>(null);
  const [overdueCount, setOverdueCount] = useState(0);

  const [summary, setSummary] = useState({
    outrightCount: 0,
    outrightTotal: 0,
    installmentCount: 0,
    installmentTotal: 0,
    outstandingBalance: 0,
  });

  const [paymentSale, setPaymentSale] = useState<DashboardSale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleForm, setSaleForm] = useState(EMPTY_SALE_FORM);
  const [creatingSale, setCreatingSale] = useState(false);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, properties, users, marketersList, customersList] =
        await Promise.all([
          getSalesDashboard(),
          listProperties("AVAILABLE"),
          listUsers(),
          listUsers("AFFILIATE_MARKETER").catch(() => [] as ManagementUser[]),
          listCustomers().catch(() => [] as Customer[]),
        ]);
      setAllSales(dashboard.sales);
      setSummary(dashboard.summary);
      setAvailableProperties(properties);
      setStaff(users);
      setApprovedMarketers(
        marketersList.filter((m) => m.marketerStatus === "APPROVED"),
      );
      setCustomers(customersList);
      try {
        setOverdueCount((await listOverdueSales()).length);
      } catch {
        // role-gated the same as the list above; ignore if the caller can't see it
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load sales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const installmentSales = useMemo(
    () => allSales.filter((s) => s.saleType === "INSTALLMENT"),
    [allSales],
  );
  const outrightSales = useMemo(
    () => allSales.filter((s) => s.saleType === "OUTRIGHT"),
    [allSales],
  );

  const staffNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff) map.set(s.id, getFullName(s));
    return map;
  }, [staff]);

  const handleTabChange = (value: string) => {
    const next =
      value === "outright" ? "outright" : value === "installment" ? "installment" : "all";
    setTab(next);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  const handleLogPayment = async () => {
    if (!paymentSale || !paymentAmount) return;
    if (Number(paymentAmount) > paymentSale.balance) {
      toast.error(`Payment exceeds remaining balance of ${formatCurrency(paymentSale.balance)}.`);
      return;
    }
    setSaving(true);
    try {
      await addInstallmentPayment(paymentSale.id, {
        amountPaid: paymentAmount,
        paidAt: new Date().toISOString().slice(0, 10),
      });
      toast.success("Payment logged.");
      setPaymentSale(null);
      setPaymentAmount("");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not log payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === saleForm.selectedCustomerId) ?? null,
    [customers, saleForm.selectedCustomerId],
  );

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          getFullName(c).toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, customerSearch]);

  const handleSelectCustomer = (c: Customer) => {
    setSaleForm((f) => ({
      ...f,
      selectedCustomerId: c.id,
      buyerFirstName: c.firstName,
      buyerMiddleName: c.middleName ?? "",
      buyerLastName: c.lastName ?? "",
      buyerPhone: c.phone,
      buyerEmail: c.email ?? "",
    }));
    setCustomerSearch("");
    setCustomerDropdownOpen(false);
  };

  const handleClearCustomer = () => {
    setSaleForm((f) => ({
      ...f,
      selectedCustomerId: "",
      buyerFirstName: "",
      buyerMiddleName: "",
      buyerLastName: "",
      buyerPhone: "",
      buyerEmail: "",
    }));
  };

  const handleRecordSale = async () => {
    const isExisting = saleForm.buyerMode === "existing";
    if (
      !saleForm.propertyId ||
      !saleForm.totalAmount
    ) {
      toast.error("Please select a property and enter the total amount.");
      return;
    }
    if (isExisting && !saleForm.selectedCustomerId) {
      toast.error("Please select a customer from the list or switch to New Buyer.");
      return;
    }
    if (!isExisting) {
      if (!saleForm.buyerFirstName || !saleForm.buyerLastName || !saleForm.buyerPhone) {
        toast.error("Buyer first name, last name and phone are required.");
        return;
      }
      if (!saleForm.buyerEmail) {
        toast.error("Email is required to create a new buyer account.");
        return;
      }
    }
    setCreatingSale(true);
    try {
      let resolvedCustomerId = saleForm.selectedCustomerId || undefined;

      if (!isExisting) {
        const newCustomer = await createCustomer({
          firstName: saleForm.buyerFirstName,
          middleName: saleForm.buyerMiddleName || undefined,
          lastName: saleForm.buyerLastName || undefined,
          phone: saleForm.buyerPhone,
          email: saleForm.buyerEmail,
        });
        resolvedCustomerId = newCustomer.id;
        setCustomers((prev) => [newCustomer, ...prev]);
      }

      await createSale({
        propertyId: saleForm.propertyId,
        customerId: resolvedCustomerId,
        buyerFirstName: isExisting
          ? (selectedCustomer?.firstName ?? saleForm.buyerFirstName)
          : saleForm.buyerFirstName,
        buyerMiddleName: isExisting
          ? (selectedCustomer?.middleName ?? saleForm.buyerMiddleName) || undefined
          : saleForm.buyerMiddleName || undefined,
        buyerLastName: isExisting
          ? (selectedCustomer?.lastName ?? saleForm.buyerLastName)
          : saleForm.buyerLastName,
        buyerPhone: isExisting
          ? (selectedCustomer?.phone ?? saleForm.buyerPhone)
          : saleForm.buyerPhone,
        buyerEmail: isExisting
          ? (selectedCustomer?.email ?? saleForm.buyerEmail) || undefined
          : saleForm.buyerEmail,
        saleType: saleForm.saleType,
        totalAmount: saleForm.totalAmount,
        soldById: user?.id,
        marketerId: saleForm.marketerId || undefined,
      });
      toast.success(
        saleForm.marketerId
          ? "Sale recorded and referral created for the attributed marketer."
          : "Sale recorded.",
      );
      setSaleDialogOpen(false);
      setSaleForm(EMPTY_SALE_FORM);
      setCustomerSearch("");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not record sale.",
      );
    } finally {
      setCreatingSale(false);
    }
  };

  const handleVoid = async (saleId: string) => {
    const ok = await confirm({
      title: "Void this sale?",
      description:
        "The property returns to Available and this can't be undone.",
      confirmLabel: "Void Sale",
      destructive: true,
    });
    if (!ok) return;
    setVoidingId(saleId);
    try {
      await voidSale(saleId);
      toast.success("Sale voided.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not void sale.");
    } finally {
      setVoidingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sales"
        subtitle="Every recorded outright and installment purchase."
        action={
          <Button onClick={() => setSaleDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Record Sale
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Outright Sales"
          value={summary.outrightCount}
          sublabel={formatCurrency(summary.outrightTotal)}
          icon={<Wallet className="h-6 w-6" />}
        />
        <StatCard
          label="Installment Sales"
          value={summary.installmentCount}
          sublabel={formatCurrency(summary.installmentTotal)}
          icon={<Wallet className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(summary.outstandingBalance)}
          sublabel="Across installment plans"
          icon={<Wallet className="h-6 w-6" />}
          variant="destructive"
        />
        <StatCard
          label="Overdue Installments"
          value={overdueCount}
          sublabel="Past expected payment date"
          icon={<Wallet className="h-6 w-6" />}
          variant="destructive"
        />
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Sales ({allSales.length})</TabsTrigger>
          <TabsTrigger value="installment">Installment ({installmentSales.length})</TabsTrigger>
          <TabsTrigger value="outright">Outright ({outrightSales.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Property</DataTableHeadCell>
              <DataTableHeadCell>Buyer</DataTableHeadCell>
              <DataTableHeadCell align="center">Type</DataTableHeadCell>
              <DataTableHeadCell align="right">Total Amount</DataTableHeadCell>
              <DataTableHeadCell align="right">Paid / Balance</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
              <DataTableHeadCell align="center">Action</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {!loading && allSales.length === 0 && (
                <DataTableEmpty colSpan={7} />
              )}
              {allSales.map((sale, idx) => {
                const voided = sale.status === "VOIDED";
                const isInstallment = sale.saleType === "INSTALLMENT";
                return (
                  <DataTableRow
                    key={sale.id}
                    index={idx}
                    className={voided ? "opacity-50" : undefined}
                  >
                    <DataTableCell>
                      <p className="font-medium">{sale.propertyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.saleDate)}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <p>{buyerDisplayName(sale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.buyerPhone}
                      </p>
                    </DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={sale.saleType} />
                    </DataTableCell>
                    <DataTableCell align="right" className="font-medium">
                      {formatCurrency(sale.totalAmount)}
                    </DataTableCell>
                    <DataTableCell align="right">
                      {isInstallment ? (
                        <div>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(sale.paidAmount)}
                          </p>
                          <p
                            className={
                              sale.balance > 0
                                ? "text-[11px] text-destructive font-semibold"
                                : "text-[11px] text-emerald-600 font-semibold"
                            }
                          >
                            {sale.balance > 0
                              ? `Bal: ${formatCurrency(sale.balance)}`
                              : "Fully Paid"}
                          </p>
                        </div>
                      ) : (
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      )}
                    </DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={sale.status ?? "ACTIVE"} />
                    </DataTableCell>
                    <DataTableCell align="center">
                      <div className="flex justify-center gap-1">
                        <Link href={`/management/sales/${sale.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                        </Link>
                        {isInstallment && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={voided}
                            onClick={() => setPaymentSale(sale)}
                          >
                            Log Payment
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={voided || voidingId === sale.id}
                          onClick={() => handleVoid(sale.id)}
                        >
                          Void
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        </TabsContent>

        <TabsContent value="installment" className="mt-6">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Property</DataTableHeadCell>
              <DataTableHeadCell>Buyer</DataTableHeadCell>
              <DataTableHeadCell align="right">Total</DataTableHeadCell>
              <DataTableHeadCell align="right">Paid</DataTableHeadCell>
              <DataTableHeadCell align="right">Balance</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
              <DataTableHeadCell align="center">Action</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {!loading && installmentSales.length === 0 && (
                <DataTableEmpty colSpan={7} />
              )}
              {installmentSales.map((sale, idx) => {
                const voided = sale.status === "VOIDED";
                return (
                  <DataTableRow
                    key={sale.id}
                    index={idx}
                    className={voided ? "opacity-50" : undefined}
                  >
                    <DataTableCell>
                      <p className="font-medium">{sale.propertyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.saleDate)}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <p>{buyerDisplayName(sale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.buyerPhone}
                      </p>
                    </DataTableCell>
                    <DataTableCell align="right">
                      {formatCurrency(sale.totalAmount)}
                    </DataTableCell>
                    <DataTableCell align="right">
                      {formatCurrency(sale.paidAmount)}
                    </DataTableCell>
                    <DataTableCell align="right">
                      <span
                        className={
                          sale.balance > 0
                            ? "text-destructive font-semibold"
                            : "text-emerald-700"
                        }
                      >
                        {formatCurrency(sale.balance)}
                      </span>
                    </DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={sale.status ?? "ACTIVE"} />
                    </DataTableCell>
                    <DataTableCell align="center">
                      <div className="flex justify-center gap-1">
                        <Link href={`/management/sales/${sale.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={voided || sale.balance <= 0}
                          onClick={() => setPaymentSale(sale)}
                        >
                          Log Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={voided || voidingId === sale.id}
                          onClick={() => handleVoid(sale.id)}
                        >
                          Void
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        </TabsContent>

        <TabsContent value="outright" className="mt-6">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Property</DataTableHeadCell>
              <DataTableHeadCell>Buyer</DataTableHeadCell>
              <DataTableHeadCell align="right">Amount</DataTableHeadCell>
              <DataTableHeadCell>Sold By</DataTableHeadCell>
              <DataTableHeadCell>Marketer</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
              <DataTableHeadCell align="center">Action</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {!loading && outrightSales.length === 0 && (
                <DataTableEmpty colSpan={7} />
              )}
              {outrightSales.map((sale, idx) => {
                const voided = sale.status === "VOIDED";
                return (
                  <DataTableRow
                    key={sale.id}
                    index={idx}
                    className={voided ? "opacity-50" : undefined}
                  >
                    <DataTableCell>
                      <p className="font-medium">{sale.propertyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.saleDate)}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <p>{buyerDisplayName(sale)}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.buyerPhone}
                      </p>
                    </DataTableCell>
                    <DataTableCell align="right">
                      {formatCurrency(sale.totalAmount)}
                    </DataTableCell>
                    <DataTableCell>
                      {sale.soldById
                        ? (staffNameById.get(sale.soldById) ?? sale.soldById)
                        : "—"}
                    </DataTableCell>
                    <DataTableCell>{sale.marketerId ?? "—"}</DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={sale.status ?? "ACTIVE"} />
                    </DataTableCell>
                    <DataTableCell align="center">
                      <div className="flex justify-center gap-1">
                        <Link href={`/management/sales/${sale.id}`}>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={voided || voidingId === sale.id}
                          onClick={() => handleVoid(sale.id)}
                        >
                          Void
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!paymentSale}
        onOpenChange={(open) => !open && setPaymentSale(null)}
      >
        <DialogDescription className="invisible">
          Payment-Sales
        </DialogDescription>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Installment Payment</DialogTitle>
          </DialogHeader>
          {paymentSale && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {paymentSale.propertyName} — balance{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(paymentSale.balance)}
                </span>
              </p>
              <div className="grid gap-2">
                <Label>Amount Paid (₦)</Label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="15000000"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentSale(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleLogPayment}
              disabled={saving || !paymentAmount}
            >
              {saving ? "Saving…" : "Log Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogDescription className="invisible">Sales</DialogDescription>
        <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 overflow-y-auto pr-1">
            <div className="grid gap-2">
              <Label>Property</Label>
              <Select
                value={saleForm.propertyId}
                onValueChange={(v) => {
                  const chosen = availableProperties.find((p) => p.id === v);
                  setSaleForm((f) => ({
                    ...f,
                    propertyId: v,
                    totalAmount:
                      f.saleType === "OUTRIGHT" && chosen
                        ? String(chosen.price)
                        : f.totalAmount,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an available property…" />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No available properties
                    </div>
                  )}
                  {availableProperties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} — {formatCurrency(Number(p.price))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 rounded-md border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Buyer</p>
                <div className="flex rounded-md border overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setSaleForm((f) => ({ ...f, buyerMode: "existing", selectedCustomerId: "", buyerFirstName: "", buyerMiddleName: "", buyerLastName: "", buyerPhone: "", buyerEmail: "" }));
                      setCustomerSearch("");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      saleForm.buyerMode === "existing"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSaleForm((f) => ({ ...f, buyerMode: "new", selectedCustomerId: "", buyerFirstName: "", buyerMiddleName: "", buyerLastName: "", buyerPhone: "", buyerEmail: "" }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                      saleForm.buyerMode === "new"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New Buyer
                  </button>
                </div>
              </div>

              {saleForm.buyerMode === "existing" ? (
                <div className="grid gap-2">
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{getFullName(selectedCustomer)}</p>
                        <p className="text-xs text-muted-foreground">{selectedCustomer.phone}{selectedCustomer.email ? ` · ${selectedCustomer.email}` : ""}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearCustomer}
                        className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Change customer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                          ref={customerSearchRef}
                          type="text"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setCustomerDropdownOpen(true);
                          }}
                          onFocus={() => setCustomerDropdownOpen(true)}
                          placeholder="Search by name, phone or email…"
                          className="w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      {customerDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                          {filteredCustomers.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-muted-foreground">
                              {customers.length === 0 ? "No customers in database yet." : "No customers match your search."}
                            </p>
                          ) : (
                            filteredCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleSelectCustomer(c); }}
                                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                              >
                                <span className="font-medium text-foreground">{getFullName(c)}</span>
                                <span className="text-xs text-muted-foreground">{c.phone}{c.email ? ` · ${c.email}` : ""}</span>
                              </button>
                            ))
                          )}
                          {customers.length > 8 && !customerSearch && (
                            <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">Type to search all {customers.length} customers…</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {!selectedCustomer && (
                    <p className="text-[11px] text-muted-foreground">Select an existing customer to auto-fill buyer details, or switch to New Buyer to register someone new.</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">First Name</Label>
                      <Input
                        value={saleForm.buyerFirstName}
                        onChange={(e) =>
                          setSaleForm((f) => ({ ...f, buyerFirstName: e.target.value }))
                        }
                        placeholder="Ada"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Last Name</Label>
                      <Input
                        value={saleForm.buyerLastName}
                        onChange={(e) =>
                          setSaleForm((f) => ({ ...f, buyerLastName: e.target.value }))
                        }
                        placeholder="Obi"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Middle Name <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        value={saleForm.buyerMiddleName}
                        onChange={(e) =>
                          setSaleForm((f) => ({ ...f, buyerMiddleName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Phone</Label>
                      <Input
                        value={saleForm.buyerPhone}
                        onChange={(e) =>
                          setSaleForm((f) => ({ ...f, buyerPhone: e.target.value }))
                        }
                        placeholder="+2348012345678"
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">
                      Email <span className="text-destructive">*</span>
                      <span className="ml-1 text-[10px] text-muted-foreground font-normal">(used to create their account)</span>
                    </Label>
                    <Input
                      type="email"
                      value={saleForm.buyerEmail}
                      onChange={(e) =>
                        setSaleForm((f) => ({ ...f, buyerEmail: e.target.value }))
                      }
                      placeholder="ada.obi@example.com"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 items-stretch">
                  <Label>Sale Type</Label>
                  <Select
                    value={saleForm.saleType}
                    onValueChange={(v) => {
                      const newType = v as "OUTRIGHT" | "INSTALLMENT";
                      const chosen = availableProperties.find(
                        (p) => p.id === saleForm.propertyId,
                      );
                      setSaleForm((f) => ({
                        ...f,
                        saleType: newType,
                        totalAmount:
                          newType === "OUTRIGHT" && chosen
                            ? String(chosen.price)
                            : f.totalAmount,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OUTRIGHT">Outright</SelectItem>
                      <SelectItem value="INSTALLMENT">Installment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-col gap-1 items-start justify-between">
                    <Label>Total Amount (₦)</Label>
                    {saleForm.saleType === "OUTRIGHT" &&
                      saleForm.propertyId && (
                        <span className="text-[10px] uppercase font-semibold text-gold">
                          * Fixed Listing Price
                        </span>
                      )}
                  </div>
                  <Input
                    type="number"
                    value={saleForm.totalAmount}
                    onChange={(e) =>
                      setSaleForm((f) => ({
                        ...f,
                        totalAmount: e.target.value,
                      }))
                    }
                    disabled={saleForm.saleType === "OUTRIGHT"}
                    placeholder={
                      saleForm.saleType === "OUTRIGHT"
                        ? "Select a property"
                        : "Enter agreed amount"
                    }
                  />
                </div>
              </div>
              {saleForm.saleType === "OUTRIGHT" && (
                <p className="text-[11px] text-muted-foreground">
                  Total amount is locked to the property listing price for
                  outright sales. Switch to Installment to enter a custom
                  amount.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Attributed Affiliate Marketer (optional)</Label>
              <Select
                value={saleForm.marketerId || "none"}
                onValueChange={(v) =>
                  setSaleForm((f) => ({
                    ...f,
                    marketerId: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an approved marketer or leave as direct sale…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    None (Direct Sale / No Marketer)
                  </SelectItem>
                  {approvedMarketers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {getFullName(m)} ({m.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Attributing an approved marketer here automatically creates
                their commission referral upon recording.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordSale} disabled={creatingSale}>
              {creatingSale ? "Recording…" : "Record Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
