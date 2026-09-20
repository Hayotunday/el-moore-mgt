"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  CalendarCheck,
  Eye,
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
  getCustomer,
  getCustomerSales,
  updateCustomer,
  updateCustomerStage,
  deleteCustomer,
} from "@/lib/api/customers";
import { listInspections } from "@/lib/api/site-inspections";
import { listProperties } from "@/lib/api/properties";
import type {
  Customer,
  CustomerStage,
  Sale,
  SiteInspection,
  Property,
} from "@/lib/api/types";
import { formatCurrency, formatDate, getFullName, blurActiveElement } from "@/lib/utils";

const CUSTOMER_STAGES: CustomerStage[] = ["PROSPECT", "LEAD", "CLIENT", "CUSTOMER"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: PageProps) {
  const { id: customerId } = use(params);
  const router = useRouter();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [updatingStage, setUpdatingStage] = useState(false);

  // Edit Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
  });

  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [custData, salesData, allInspections, propsData] = await Promise.all([
        getCustomer(customerId),
        getCustomerSales(customerId).catch(() => []),
        listInspections().catch(() => []),
        listProperties().catch(() => []),
      ]);

      setCustomer(custData);
      setSales(salesData);
      setInspections(allInspections.filter((i) => i.customerId === customerId));
      setProperties(propsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load customer details.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalSpent = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

  const handleStageChange = async (newStage: CustomerStage) => {
    if (!customer || newStage === customer.stage) return;
    setUpdatingStage(true);
    try {
      await updateCustomerStage(customerId, newStage);
      toast.success(`Lifecycle stage updated to ${newStage}.`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update stage.");
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleOpenEditDrawer = () => {
    if (!customer) return;
    blurActiveElement();
    setEditForm({
      firstName: customer.firstName,
      middleName: customer.middleName || "",
      lastName: customer.lastName || "",
      phone: customer.phone,
      email: customer.email || "",
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.slice(0, 10) : "",
    });
    setEditDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.firstName || !editForm.phone) {
      toast.error("First name and phone number are required.");
      return;
    }
    setSavingEdit(true);
    try {
      await updateCustomer(customerId, {
        firstName: editForm.firstName,
        middleName: editForm.middleName || undefined,
        lastName: editForm.lastName || undefined,
        phone: editForm.phone,
        email: editForm.email || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
      });
      toast.success("Customer profile updated.");
      setEditDrawerOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;
    const ok = await confirm({
      title: `Delete Customer ${getFullName(customer)}?`,
      description: "This will permanently remove the customer record. This action cannot be undone.",
      confirmLabel: "Delete Customer",
      destructive: true,
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast.success("Customer record deleted.");
      router.push("/management/customers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete customer.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <PageHeader title="Customer Not Found" subtitle="The requested customer record could not be loaded." />
        <Link href="/management/customers">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Customer CRM
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/management/customers"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers CRM
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{getFullName(customer)}</h1>
            <StatusBadge status={customer.stage || "PROSPECT"} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Registered on {customer.createdAt ? formatDate(customer.createdAt) : "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenEditDrawer} className="gap-1.5">
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 gap-1.5"
            disabled={deleting}
            onClick={handleDeleteCustomer}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Properties Purchased"
          value={sales.length}
          sublabel="Completed & ongoing sales"
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          label="Total Spent Volume"
          value={formatCurrency(totalSpent)}
          icon={<DollarSign className="h-6 w-6" />}
          variant="gold"
        />
        <StatCard
          label="Site Inspections"
          value={inspections.length}
          sublabel="Attended / scheduled"
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <StatCard
          label="CRM Lifecycle Stage"
          value={customer.stage || "PROSPECT"}
          sublabel="Milestone progression"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="success"
        />
      </div>

      {/* Customer Info Card & Lifecycle Stage Updater */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact info */}
        <div className="md:col-span-2 rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contact & Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/20">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Phone Number</p>
                <p className="text-sm font-medium text-foreground">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/20">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Email Address</p>
                <p className="text-sm font-medium text-foreground">{customer.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/20">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Date of Birth</p>
                <p className="text-sm font-medium text-foreground">
                  {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/20">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase">Customer ID</p>
                <p className="text-xs font-mono font-medium text-foreground">{customer.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage override control */}
        <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Lifecycle Stage Override
          </h2>
          <p className="text-xs text-muted-foreground">
            Stages auto-upgrade as site inspections & purchases complete, but can be manually overridden.
          </p>
          <div className="grid gap-2">
            <Label>Select Stage</Label>
            <Select
              value={customer.stage || "PROSPECT"}
              disabled={updatingStage}
              onValueChange={(val) => handleStageChange(val as CustomerStage)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STAGES.map((stg) => (
                  <SelectItem key={stg} value={stg}>
                    {stg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Purchased Properties / Sales History */}
      <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            Purchased Properties ({sales.length})
          </h2>
        </div>

        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Property Title</DataTableHeadCell>
            <DataTableHeadCell>Sale Type</DataTableHeadCell>
            <DataTableHeadCell align="right">Total Amount</DataTableHeadCell>
            <DataTableHeadCell align="center">Status</DataTableHeadCell>
            <DataTableHeadCell align="right">Date</DataTableHeadCell>
            <DataTableHeadCell align="right">Actions</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {sales.length === 0 ? (
              <DataTableEmpty colSpan={6} />
            ) : (
              sales.map((sale, idx) => {
                const prop = properties.find((p) => p.id === sale.propertyId);
                return (
                  <DataTableRow key={sale.id} index={idx}>
                    <DataTableCell className="font-semibold text-foreground">
                      {prop?.title || "Property Sale"}
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-sm">
                        {sale.saleType}
                      </span>
                    </DataTableCell>
                    <DataTableCell align="right" className="font-bold text-foreground">
                      {formatCurrency(sale.totalAmount)}
                    </DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={sale.status || "ACTIVE"} />
                    </DataTableCell>
                    <DataTableCell align="right" className="text-xs text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </DataTableCell>
                    <DataTableCell align="right">
                      <Link href={`/management/sales/${sale.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 h-8">
                          <Eye className="h-3.5 w-3.5" /> Sale Details
                        </Button>
                      </Link>
                    </DataTableCell>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </DataTable>
      </div>

      {/* Site Inspections History */}
      <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Site Inspection History ({inspections.length})
          </h2>
        </div>

        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Property</DataTableHeadCell>
            <DataTableHeadCell>Scheduled Date</DataTableHeadCell>
            <DataTableHeadCell align="center">Status</DataTableHeadCell>
            <DataTableHeadCell align="right">Actions</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {inspections.length === 0 ? (
              <DataTableEmpty colSpan={4} />
            ) : (
              inspections.map((insp, idx) => {
                const prop = properties.find((p) => p.id === insp.propertyId);
                return (
                  <DataTableRow key={insp.id} index={idx}>
                    <DataTableCell className="font-semibold text-foreground">
                      {prop?.title || "Property Inspection"}
                    </DataTableCell>
                    <DataTableCell className="text-xs text-muted-foreground">
                      {formatDate(insp.scheduledAt)}
                    </DataTableCell>
                    <DataTableCell align="center">
                      <StatusBadge status={insp.status} />
                    </DataTableCell>
                    <DataTableCell align="right">
                      <Link href={`/management/inspections/${insp.id}`}>
                        <Button size="sm" variant="outline" className="gap-1 h-8">
                          <Eye className="h-3.5 w-3.5" /> Inspection Details
                        </Button>
                      </Link>
                    </DataTableCell>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </DataTable>
      </div>

      {/* Edit Drawer */}
      <Drawer open={editDrawerOpen} onOpenChange={setEditDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Customer Profile</DrawerTitle>
            <DrawerDescription>Update identity & contact details.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Middle Name (optional)</Label>
              <Input
                value={editForm.middleName}
                onChange={(e) => setEditForm((f) => ({ ...f, middleName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? "Saving…" : "Save Changes"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
