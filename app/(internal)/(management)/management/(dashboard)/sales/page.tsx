"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Wallet, Plus } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
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
import {
  listSales,
  addInstallmentPayment,
  createSale,
  type SaleWithDetails,
} from "@/lib/api/sales";
import { listProperties } from "@/lib/api/properties";
import { listUsers } from "@/lib/api/users";
import type { ManagementUser, Property, SaleType } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const EMPTY_SALE_FORM = {
  propertyId: "",
  buyerName: "",
  buyerPhone: "",
  buyerEmail: "",
  saleType: "OUTRIGHT" as SaleType,
  totalAmount: "",
  marketerId: "",
};

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
  const initialTab =
    searchParams.get("tab") === "outright" ? "outright" : "installment";

  const [tab, setTab] = useState<"installment" | "outright">(initialTab);
  const [loading, setLoading] = useState(true);
  const [installmentSales, setInstallmentSales] = useState<SaleWithDetails[]>(
    [],
  );
  const [outrightSales, setOutrightSales] = useState<SaleWithDetails[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>(
    [],
  );
  const [staff, setStaff] = useState<ManagementUser[]>([]);

  const [paymentSale, setPaymentSale] = useState<SaleWithDetails | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [saleForm, setSaleForm] = useState(EMPTY_SALE_FORM);
  const [creatingSale, setCreatingSale] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [installments, outright, properties, users] = await Promise.all([
        listSales("INSTALLMENT"),
        listSales("OUTRIGHT"),
        listProperties("AVAILABLE"),
        listUsers(),
      ]);
      setInstallmentSales(installments);
      setOutrightSales(outright);
      setAvailableProperties(properties);
      setStaff(users);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load sales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const staffNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of staff) map.set(s.id, s.name);
    return map;
  }, [staff]);

  const handleTabChange = (value: string) => {
    const next = value === "outright" ? "outright" : "installment";
    setTab(next);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  const handleLogPayment = async () => {
    if (!paymentSale || !paymentAmount) return;
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

  const handleRecordSale = async () => {
    if (
      !saleForm.propertyId ||
      !saleForm.buyerName ||
      !saleForm.buyerPhone ||
      !saleForm.totalAmount
    ) {
      toast.error("Property, buyer name, phone and amount are required.");
      return;
    }
    setCreatingSale(true);
    try {
      await createSale({
        propertyId: saleForm.propertyId,
        buyerName: saleForm.buyerName,
        buyerPhone: saleForm.buyerPhone,
        buyerEmail: saleForm.buyerEmail || undefined,
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
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not record sale.",
      );
    } finally {
      setCreatingSale(false);
    }
  };

  const totalOutright = outrightSales.reduce(
    (sum, s) => sum + Number(s.totalAmount),
    0,
  );
  const totalInstallment = installmentSales.reduce(
    (sum, s) => sum + Number(s.totalAmount),
    0,
  );
  const totalOutstanding = installmentSales.reduce(
    (sum, s) => sum + s.balance,
    0,
  );

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Outright Sales"
          value={outrightSales.length}
          sublabel={formatCurrency(totalOutright)}
          icon={<Wallet className="h-6 w-6" />}
        />
        <StatCard
          label="Installment Sales"
          value={installmentSales.length}
          sublabel={formatCurrency(totalInstallment)}
          icon={<Wallet className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Outstanding Balance"
          value={formatCurrency(totalOutstanding)}
          sublabel="Across installment plans"
          icon={<Wallet className="h-6 w-6" />}
          variant="destructive"
        />
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="installment">Installment Purchases</TabsTrigger>
          <TabsTrigger value="outright">Outright Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="installment" className="mt-6">
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Property</DataTableHeadCell>
              <DataTableHeadCell>Buyer</DataTableHeadCell>
              <DataTableHeadCell align="right">Total</DataTableHeadCell>
              <DataTableHeadCell align="right">Paid</DataTableHeadCell>
              <DataTableHeadCell align="right">Balance</DataTableHeadCell>
              <DataTableHeadCell align="center">Action</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {!loading && installmentSales.length === 0 && (
                <DataTableEmpty colSpan={6} />
              )}
              {installmentSales.map((sale, idx) => (
                <DataTableRow key={sale.id} index={idx}>
                  <DataTableCell>
                    <p className="font-medium">{sale.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </p>
                  </DataTableCell>
                  <DataTableCell>
                    <p>{sale.buyerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.buyerPhone}
                    </p>
                  </DataTableCell>
                  <DataTableCell align="right">
                    {formatCurrency(sale.totalAmount)}
                  </DataTableCell>
                  <DataTableCell align="right">
                    {formatCurrency(sale.amountPaid)}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPaymentSale(sale)}
                    >
                      Log Payment
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))}
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
            </DataTableHead>
            <DataTableBody>
              {!loading && outrightSales.length === 0 && (
                <DataTableEmpty colSpan={5} />
              )}
              {outrightSales.map((sale, idx) => (
                <DataTableRow key={sale.id} index={idx}>
                  <DataTableCell>
                    <p className="font-medium">{sale.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </p>
                  </DataTableCell>
                  <DataTableCell>
                    <p>{sale.buyerName}</p>
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
                </DataTableRow>
              ))}
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
                {paymentSale.propertyTitle} — balance{" "}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Property</Label>
              <Select
                value={saleForm.propertyId}
                onValueChange={(v) =>
                  setSaleForm((f) => ({ ...f, propertyId: v }))
                }
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
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Buyer Name</Label>
                <Input
                  value={saleForm.buyerName}
                  onChange={(e) =>
                    setSaleForm((f) => ({ ...f, buyerName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Buyer Phone</Label>
                <Input
                  value={saleForm.buyerPhone}
                  onChange={(e) =>
                    setSaleForm((f) => ({ ...f, buyerPhone: e.target.value }))
                  }
                  placeholder="+2348012345678"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Buyer Email (optional)</Label>
              <Input
                type="email"
                value={saleForm.buyerEmail}
                onChange={(e) =>
                  setSaleForm((f) => ({ ...f, buyerEmail: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sale Type</Label>
                <Select
                  value={saleForm.saleType}
                  onValueChange={(v) =>
                    setSaleForm((f) => ({ ...f, saleType: v as SaleType }))
                  }
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
                <Label>Total Amount (₦)</Label>
                <Input
                  type="number"
                  value={saleForm.totalAmount}
                  onChange={(e) =>
                    setSaleForm((f) => ({ ...f, totalAmount: e.target.value }))
                  }
                  placeholder="220000000"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>External Marketer ID (optional)</Label>
              <Input
                value={saleForm.marketerId}
                onChange={(e) =>
                  setSaleForm((f) => ({ ...f, marketerId: e.target.value }))
                }
                placeholder="Leave blank if no marketer referred this sale"
              />
              <p className="text-xs text-muted-foreground">
                Attributing a marketer here automatically creates their
                commission referral.
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
