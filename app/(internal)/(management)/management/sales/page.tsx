"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { listSales, addInstallmentPayment, type SaleWithDetails } from "@/lib/api/sales";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  const initialTab = searchParams.get("tab") === "outright" ? "outright" : "installment";

  const [tab, setTab] = useState<"installment" | "outright">(initialTab);
  const [loading, setLoading] = useState(true);
  const [installmentSales, setInstallmentSales] = useState<SaleWithDetails[]>([]);
  const [outrightSales, setOutrightSales] = useState<SaleWithDetails[]>([]);
  const [paymentSale, setPaymentSale] = useState<SaleWithDetails | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [installments, outright] = await Promise.all([
      listSales("INSTALLMENT"),
      listSales("OUTRIGHT"),
    ]);
    setInstallmentSales(installments);
    setOutrightSales(outright);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (value: string) => {
    const next = value === "outright" ? "outright" : "installment";
    setTab(next);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  const handleLogPayment = async () => {
    if (!paymentSale || !paymentAmount) return;
    setSaving(true);
    try {
      await addInstallmentPayment({
        saleId: paymentSale.id,
        amountPaid: Number(paymentAmount),
        paidAt: new Date().toISOString().slice(0, 10),
      });
      toast.success("Payment logged.");
      setPaymentSale(null);
      setPaymentAmount("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log payment.");
    } finally {
      setSaving(false);
    }
  };

  const totalOutright = outrightSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalInstallment = installmentSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOutstanding = installmentSales.reduce((sum, s) => sum + s.balance, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Sales" subtitle="Every recorded outright and installment purchase." />

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
              {!loading && installmentSales.length === 0 && <DataTableEmpty colSpan={6} />}
              {installmentSales.map((sale, idx) => (
                <DataTableRow key={sale.id} index={idx}>
                  <DataTableCell>
                    <p className="font-medium">{sale.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                  </DataTableCell>
                  <DataTableCell>
                    <p>{sale.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{sale.buyerPhone}</p>
                  </DataTableCell>
                  <DataTableCell align="right">{formatCurrency(sale.totalAmount)}</DataTableCell>
                  <DataTableCell align="right">{formatCurrency(sale.amountPaid)}</DataTableCell>
                  <DataTableCell align="right">
                    <span className={sale.balance > 0 ? "text-destructive font-semibold" : "text-emerald-700"}>
                      {formatCurrency(sale.balance)}
                    </span>
                  </DataTableCell>
                  <DataTableCell align="center">
                    <Button size="sm" variant="outline" onClick={() => setPaymentSale(sale)}>
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
              {!loading && outrightSales.length === 0 && <DataTableEmpty colSpan={5} />}
              {outrightSales.map((sale, idx) => (
                <DataTableRow key={sale.id} index={idx}>
                  <DataTableCell>
                    <p className="font-medium">{sale.propertyTitle}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                  </DataTableCell>
                  <DataTableCell>
                    <p>{sale.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{sale.buyerPhone}</p>
                  </DataTableCell>
                  <DataTableCell align="right">{formatCurrency(sale.totalAmount)}</DataTableCell>
                  <DataTableCell>{sale.soldByName ?? "—"}</DataTableCell>
                  <DataTableCell>{sale.marketerName ?? "—"}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </TabsContent>
      </Tabs>

      <Dialog open={!!paymentSale} onOpenChange={(open) => !open && setPaymentSale(null)}>
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
            <Button onClick={handleLogPayment} disabled={saving || !paymentAmount}>
              {saving ? "Saving…" : "Log Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
