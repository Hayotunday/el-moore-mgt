"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { getInspection, updateInspection } from "@/lib/api/site-inspections";
import { getProperty } from "@/lib/api/properties";
import { getCustomer } from "@/lib/api/customers";
import type { SiteInspection, Property, Customer, InspectionStatus } from "@/lib/api/types";
import { formatDate, getFullName, formatCurrency } from "@/lib/utils";

const INSPECTION_STATUSES: InspectionStatus[] = ["SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED"];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InspectionDetailPage({ params }: PageProps) {
  const { id: inspectionId } = use(params);
  const router = useRouter();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<SiteInspection | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const inspData = await getInspection(inspectionId);
      setInspection(inspData);
      setNotes(inspData.notes || "");

      const [propData, custData] = await Promise.all([
        getProperty(inspData.propertyId).catch(() => null),
        inspData.customerId ? getCustomer(inspData.customerId).catch(() => null) : Promise.resolve(null),
      ]);

      setProperty(propData);
      setCustomer(custData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load site inspection details.");
    } finally {
      setLoading(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (newStatus: InspectionStatus) => {
    if (!inspection || newStatus === inspection.status) return;

    if (newStatus === "CANCELLED") {
      const ok = await confirm({
        title: "Cancel Site Inspection?",
        description: "Are you sure you want to mark this inspection as cancelled?",
        confirmLabel: "Cancel Inspection",
        destructive: true,
      });
      if (!ok) return;
    }

    setUpdatingStatus(true);
    try {
      await updateInspection(inspectionId, { status: newStatus });
      toast.success(`Inspection status updated to ${newStatus}.`);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateInspection(inspectionId, { notes });
      toast.success("Inspection notes saved.");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="space-y-4">
        <PageHeader title="Inspection Not Found" subtitle="The requested site inspection could not be loaded." />
        <Link href="/management/inspections">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Site Inspections
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/management/inspections"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Site Inspections
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Inspection #{inspection.id.slice(0, 8)}
            </h1>
            <StatusBadge status={inspection.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Scheduled for {formatDate(inspection.scheduledAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {inspection.status === "SCHEDULED" && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 gap-1"
                disabled={updatingStatus}
                onClick={() => handleStatusChange("CANCELLED")}
              >
                <XCircle className="h-4 w-4" /> Cancel Inspection
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                disabled={updatingStatus}
                onClick={() => handleStatusChange("COMPLETED")}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark Completed
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Scheduled Date"
          value={formatDate(inspection.scheduledAt)}
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <StatCard
          label="Status"
          value={inspection.status}
          icon={<Clock className="h-6 w-6" />}
          variant={inspection.status === "COMPLETED" ? "success" : inspection.status === "CANCELLED" ? "destructive" : "default"}
        />
        <StatCard
          label="Target Property"
          value={property?.title || "Property"}
          sublabel={property?.location || "Site location"}
          icon={<Building2 className="h-6 w-6" />}
          variant="gold"
        />
      </div>

      {/* Relational Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Card */}
        <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Property Under Inspection
              </h2>
              <p className="text-lg font-bold text-foreground">{property?.title || "Property Details"}</p>
            </div>
          </div>
          {property && (
            <div className="space-y-1 text-sm text-muted-foreground border-t pt-3">
              <p>Location: <span className="font-medium text-foreground">{property.location}</span></p>
              <p>Price: <span className="font-medium text-foreground">{formatCurrency(property.price)}</span></p>
              <p>Status: <span className="font-medium text-foreground">{property.status}</span></p>
              <div className="pt-2">
                <Link
                  href={`/management/properties/${property.id}`}
                  className="text-gold hover:underline text-xs font-semibold"
                >
                  View Property Profile →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Visitor / Customer Card */}
        <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Visiting Customer Profile
              </h2>
              <p className="text-lg font-bold text-foreground">
                {customer ? getFullName(customer) : "Visitor / Prospect"}
              </p>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground border-t pt-3">
            <p>Phone: <span className="font-medium text-foreground">{customer?.phone || "—"}</span></p>
            <p>Email: <span className="font-medium text-foreground">{customer?.email || "—"}</span></p>
            {customer && (
              <div className="pt-2">
                <Link
                  href={`/management/customers/${customer.id}`}
                  className="text-primary hover:underline text-xs font-semibold"
                >
                  View Customer CRM Profile →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operational Notes & Status Override */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes Editor */}
        <div className="md:col-span-2 rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              Inspector & Follow-up Notes
            </h2>
          </div>
          <div className="grid gap-2">
            <Textarea
              rows={5}
              placeholder="Record visitor comments, preferred plot selections, guide observations, or follow-up tasks…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveNotes} disabled={savingNotes} className="gap-1.5">
              <Save className="h-4 w-4" />
              {savingNotes ? "Saving Notes…" : "Save Notes"}
            </Button>
          </div>
        </div>

        {/* Status Override Selector */}
        <div className="rounded-lg border bg-card p-6 space-y-4 shadow-ambient">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Status Management
          </h2>
          <div className="grid gap-2">
            <Label>Inspection Status</Label>
            <Select
              value={inspection.status}
              disabled={updatingStatus}
              onValueChange={(val) => handleStatusChange(val as InspectionStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSPECTION_STATUSES.map((stg) => (
                  <SelectItem key={stg} value={stg}>
                    {stg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
