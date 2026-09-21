"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Handshake,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Upload,
  Download,
  Trash2,
  ArrowLeft,
  Loader2,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import {
  getSale,
  getInstallmentPlan,
  listPayments,
  addInstallmentPayment,
  listSaleDocuments,
  uploadSaleDocument,
  getSaleDocumentUrl,
  removeSaleDocument,
  voidSale,
} from "@/lib/api/sales";
import { getProperty } from "@/lib/api/properties";
import { getCustomer } from "@/lib/api/customers";
import type {
  Sale,
  Property,
  Customer,
  InstallmentPlan,
  InstallmentPayment,
  SaleDocument,
  SaleDocumentType,
} from "@/lib/api/types";
import { formatCurrency, formatDate, getFullName, blurActiveElement } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SaleDetailPage({ params }: PageProps) {
  const { id: saleId } = use(params);
  const router = useRouter();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<Sale | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [plan, setPlan] = useState<InstallmentPlan | null>(null);
  const [payments, setPayments] = useState<InstallmentPayment[]>([]);
  const [documents, setDocuments] = useState<SaleDocument[]>([]);

  // Payment Drawer state
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Document Upload state
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<SaleDocumentType>("CONTRACT");
  const [uploading, setUploading] = useState(false);

  // Document downloading / deleting busy states
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [voiding, setVoiding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const saleData = await getSale(saleId);
      setSale(saleData);

      const [propData, custData, docData] = await Promise.all([
        getProperty(saleData.propertyId).catch(() => null),
        saleData.customerId ? getCustomer(saleData.customerId).catch(() => null) : Promise.resolve(null),
        listSaleDocuments(saleId).catch(() => []),
      ]);

      setProperty(propData);
      setCustomer(custData);
      setDocuments(docData);

      if (saleData.saleType === "INSTALLMENT") {
        const [planData, paymentsData] = await Promise.all([
          getInstallmentPlan(saleId),
          listPayments(saleId).catch(() => []),
        ]);
        setPlan(planData);
        setPayments(paymentsData);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load sale details.");
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalAmount = Number(sale?.totalAmount || 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
  const balance = Math.max(0, totalAmount - totalPaid);
  const progressPercent = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  const handleOpenPaymentDrawer = () => {
    blurActiveElement();
    setAmountPaid("");
    setPaymentNote("");
    setPaymentDrawerOpen(true);
  };

  const handleSavePayment = async () => {
    if (!amountPaid || Number(amountPaid) <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    if (Number(amountPaid) > balance) {
      toast.error(`Payment exceeds remaining balance of ${formatCurrency(balance)}.`);
      return;
    }
    setSavingPayment(true);
    try {
      await addInstallmentPayment(saleId, {
        amountPaid,
        paidAt: new Date().toISOString(),
        note: paymentNote || undefined,
      });
      toast.success("Installment payment logged successfully!");
      setPaymentDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not log payment.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleOpenUploadDrawer = () => {
    blurActiveElement();
    setUploadFile(null);
    setDocumentType("CONTRACT");
    setUploadDrawerOpen(true);
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    setUploading(true);
    try {
      await uploadSaleDocument(saleId, uploadFile, documentType);
      toast.success("Document uploaded successfully!");
      setUploadDrawerOpen(false);
      setUploadFile(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (doc: SaleDocument) => {
    setDownloadingDocId(doc.id);
    try {
      const downloadUrl = await getSaleDocumentUrl(saleId, doc.id);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate download link.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleDeleteDocument = async (doc: SaleDocument) => {
    const ok = await confirm({
      title: "Delete Sale Document?",
      description: `Are you sure you want to delete this ${doc.documentType} document? This action cannot be undone.`,
      confirmLabel: "Delete Document",
      destructive: true,
    });
    if (!ok) return;

    setDeletingDocId(doc.id);
    try {
      await removeSaleDocument(saleId, doc.id);
      toast.success("Document deleted.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete document.");
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleVoidSale = async () => {
    if (!sale) return;
    const ok = await confirm({
      title: "Void Sale?",
      description: `Are you sure you want to void this sale? The record will be marked as VOIDED, and property "${property?.title || "Property"}" will be released back to AVAILABLE.`,
      confirmLabel: "Void Sale",
      destructive: true,
    });
    if (!ok) return;

    setVoiding(true);
    try {
      await voidSale(sale.id);
      toast.success("Sale has been voided.");
      router.push("/management/sales");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not void sale.");
    } finally {
      setVoiding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="space-y-4">
        <PageHeader title="Sale Not Found" subtitle="The requested sale could not be loaded." />
        <Link href="/management/sales">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Sales
          </Button>
        </Link>
      </div>
    );
  }

  const isVoided = sale.status === "VOIDED";

  return (
    <div className="space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/management/sales"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sales Overview
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Sale #{sale.id.slice(0, 8)}
            </h1>
            <StatusBadge status={sale.status || "ACTIVE"} />
            <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {sale.saleType}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Recorded on {formatDate(sale.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sale.saleType === "INSTALLMENT" && !isVoided && balance > 0 && (
            <Button onClick={handleOpenPaymentDrawer} className="gap-2">
              <Plus className="h-4 w-4" /> Log Payment
            </Button>
          )}
          {!isVoided && (
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 gap-1.5"
              disabled={voiding}
              onClick={handleVoidSale}
            >
              <Ban className="h-4 w-4" /> Void Sale
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Sale Amount"
          value={formatCurrency(totalAmount)}
          icon={<DollarSign className="h-6 w-6" />}
        />
        {sale.saleType === "INSTALLMENT" ? (
          <>
            <StatCard
              label="Amount Paid"
              value={formatCurrency(totalPaid)}
              sublabel={`${progressPercent}% paid off`}
              icon={<CheckCircle2 className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              label="Remaining Balance"
              value={formatCurrency(balance)}
              sublabel={balance === 0 ? "Fully Paid" : "Outstanding balance"}
              icon={<Clock className="h-6 w-6" />}
              variant={balance > 0 ? "destructive" : "default"}
            />
            <StatCard
              label="Installment Plan"
              value={plan ? `${plan.numberOfInstallments} Installments` : "No plan"}
              sublabel={plan ? `Started ${formatDate(plan.startDate)}` : "—"}
              icon={<Calendar className="h-6 w-6" />}
            />
          </>
        ) : (
          <StatCard
            label="Payment Status"
            value="Fully Paid"
            sublabel="Outright purchase"
            icon={<CheckCircle2 className="h-6 w-6" />}
            variant="success"
          />
        )}
      </div>

      {/* Relational Cards: Property, Buyer, Marketer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Property Info */}
        <div className="rounded-lg border bg-card p-5 space-y-3 shadow-ambient">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Property
              </h3>
              <p className="text-base font-bold text-foreground leading-tight">
                {property?.title || "Property Details"}
              </p>
            </div>
          </div>
          {property && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>Location: <span className="font-medium text-foreground">{property.location || "N/A"}</span></p>
              <p>Price: <span className="font-medium text-foreground">{formatCurrency(property.price)}</span></p>
              <Link
                href={`/management/properties/${property.id}`}
                className="inline-block text-gold hover:underline font-semibold mt-1"
              >
                View Property Profile →
              </Link>
            </div>
          )}
        </div>

        {/* Customer / Buyer Info */}
        <div className="rounded-lg border bg-card p-5 space-y-3 shadow-ambient">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Buyer Profile
              </h3>
              <p className="text-base font-bold text-foreground leading-tight">
                {customer ? getFullName(customer) : sale.buyerPhone || "Buyer"}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>Phone: <span className="font-medium text-foreground">{customer?.phone || sale.buyerPhone || "—"}</span></p>
            <p>Email: <span className="font-medium text-foreground">{customer?.email || sale.buyerEmail || "—"}</span></p>
            {customer && (
              <Link
                href={`/management/customers/${customer.id}`}
                className="inline-block text-primary hover:underline font-semibold mt-1"
              >
                View Customer CRM Profile →
              </Link>
            )}
          </div>
        </div>

        {/* Marketer Attribution */}
        <div className="rounded-lg border bg-card p-5 space-y-3 shadow-ambient">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Attributed Marketer
              </h3>
              <p className="text-base font-bold text-foreground leading-tight">
                {sale.marketerId ? "Affiliate Partner" : "Direct / Staff Sale"}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            {sale.marketerId ? (
              <Link
                href={`/management/marketers/${sale.marketerId}`}
                className="inline-block text-emerald-600 hover:underline font-semibold mt-1"
              >
                View Marketer Profile →
              </Link>
            ) : (
              <p className="text-muted-foreground italic">No external affiliate marketer attached.</p>
            )}
          </div>
        </div>
      </div>

      {/* Installment Payments Breakdown (if installment) */}
      {sale.saleType === "INSTALLMENT" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Payment Schedule & Log</h2>
              <p className="text-xs text-muted-foreground">
                {payments.length} payment(s) recorded to date.
              </p>
            </div>
            {!isVoided && balance > 0 && (
              <Button size="sm" onClick={handleOpenPaymentDrawer} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Log Payment
              </Button>
            )}
          </div>

          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Date Paid</DataTableHeadCell>
              <DataTableHeadCell align="right">Amount</DataTableHeadCell>
              <DataTableHeadCell>Note / Reference</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {payments.length === 0 ? (
                <DataTableEmpty colSpan={3} />
              ) : (
                payments.map((p, idx) => (
                  <DataTableRow key={p.id} index={idx}>
                    <DataTableCell>{formatDate(p.paidAt)}</DataTableCell>
                    <DataTableCell align="right" className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.amountPaid)}
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground">
                      {p.note || "Standard installment payment"}
                    </DataTableCell>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>
      )}

      {/* Sale Documents Section (R2 Presigned Upload & Download Specification) */}
      <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              Sale Documents ({documents.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Uploaded contracts, deed agreements, and buyer identification files.
            </p>
          </div>
          <Button size="sm" onClick={handleOpenUploadDrawer} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>

        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Document Type</DataTableHeadCell>
            <DataTableHeadCell>Upload Date</DataTableHeadCell>
            <DataTableHeadCell align="right">Actions</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {documents.length === 0 ? (
              <DataTableEmpty colSpan={3} />
            ) : (
              documents.map((doc, idx) => (
                <DataTableRow key={doc.id} index={idx}>
                  <DataTableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-foreground text-xs uppercase tracking-wider bg-muted px-2 py-0.5 rounded-sm">
                        {doc.documentType}
                      </span>
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-muted-foreground text-xs">
                    {formatDate(doc.uploadedAt)}
                  </DataTableCell>
                  <DataTableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        disabled={downloadingDocId === doc.id}
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        {downloadingDocId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:bg-destructive/10"
                        disabled={deletingDocId === doc.id}
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>

      {/* Log Payment Drawer */}
      <Drawer open={paymentDrawerOpen} onOpenChange={setPaymentDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Log Installment Payment</DrawerTitle>
            <DrawerDescription>
              Record a payment received for Sale #{sale.id.slice(0, 8)}.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="rounded-md bg-muted/40 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Remaining Balance:</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(balance)}</p>
            </div>
            <div className="grid gap-2">
              <Label>Amount Paid (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Note / Reference (Optional)</Label>
              <Input
                placeholder="Bank transfer ref / teller number"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setPaymentDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePayment} disabled={savingPayment}>
              {savingPayment ? "Logging…" : "Confirm Payment"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Upload Document Drawer */}
      <Drawer open={uploadDrawerOpen} onOpenChange={setUploadDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Upload Sale Document</DrawerTitle>
            <DrawerDescription>
              Upload deed agreement, buyer ID, or contract files to secure private cloud storage.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid gap-2">
              <Label>Document Category</Label>
              <Select
                value={documentType}
                onValueChange={(val) => setDocumentType(val as SaleDocumentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTRACT">Contract / Deed Agreement</SelectItem>
                  <SelectItem value="ID">Identification Document (National ID / Passport)</SelectItem>
                  <SelectItem value="OTHER">Other Attachment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Select File</Label>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setUploadDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={uploading}>
              {uploading ? "Uploading to Cloud…" : "Upload Document"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
