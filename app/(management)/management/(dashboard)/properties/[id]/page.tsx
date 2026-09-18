"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Building2, MapPinned, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/management/page-header";
import StatusBadge from "@/components/management/status-badge";
import { Button } from "@/components/ui/button";
import PropertyFormDrawer from "@/components/management/property-form-drawer";
import {
  getProperty,
  listPropertyImages,
  deleteProperty,
} from "@/lib/api/properties";
import { listSales, type SaleWithDetails } from "@/lib/api/sales";
import { listInspections } from "@/lib/api/site-inspections";
import type { Property, PropertyImage, SiteInspection } from "@/lib/api/types";
import { useConfirm } from "@/contexts/confirm-dialog-context";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [sale, setSale] = useState<SaleWithDetails | null>(null);
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, imgs] = await Promise.all([
        getProperty(id),
        listPropertyImages(id),
      ]);
      setProperty(p);
      setImages(imgs);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load this property.",
      );
    } finally {
      setLoading(false);
    }

    // Both of these are role-restricted beyond what this page allows (e.g. SITE_COORDINATOR
    // can view properties but not the admin sales list) — degrade gracefully rather than error.
    try {
      const sales = await listSales();
      setSale(sales.find((s) => s.propertyId === id) ?? null);
    } catch {
      setSale(null);
    }
    try {
      const allInspections = await listInspections();
      setInspections(allInspections.filter((i) => i.propertyId === id));
    } catch {
      setInspections([]);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!property) return;
    const ok = await confirm({
      title: `Delete "${property.title}"?`,
      description: "This removes the listing permanently and can't be undone.",
      confirmLabel: "Delete Property",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteProperty(property.id);
      toast.success("Property deleted.");
      router.push("/management/properties");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete property.",
      );
      setDeleting(false);
    }
  };

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
  const otherImages = images.filter((img) => img.id !== primaryImage?.id);

  if (loading) {
    return (
      <div className="space-y-8">
        <Link
          href="/management/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        <p className="text-muted-foreground">Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-8">
        <Link
          href="/management/properties"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        <p className="text-muted-foreground">
          This property could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/management/properties"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </Link>

      <PageHeader
        title={property.title}
        subtitle={property.location}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          {primaryImage ? (
            <div className="space-y-2">
              <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImage.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {otherImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {otherImages.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.imageUrl}
                      alt={property.title}
                      className="aspect-4/3 w-full rounded-md object-cover border border-border"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-lg border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Building2 className="h-8 w-8" />
              <p className="text-sm">No images uploaded yet.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDrawerOpen(true)}
              >
                Add Images
              </Button>
            </div>
          )}

          {/* Sale record */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Sale Record
            </h3>
            {sale ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {sale.buyerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.buyerPhone}{" "}
                      {sale.buyerEmail ? `· ${sale.buyerEmail}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={sale.saleType} />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/60 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold">
                      {formatCurrency(sale.amountPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-semibold">
                      {formatCurrency(sale.balance)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Sold {formatDate(sale.createdAt)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sale recorded for this property yet.
              </p>
            )}
          </div>

          {/* Inspection history */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <MapPinned className="h-4 w-4" /> Inspection History
            </h3>
            {inspections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No inspections scheduled for this property.
              </p>
            ) : (
              <div className="space-y-2">
                {inspections.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between text-sm bg-muted/40 rounded-sm px-3 py-2"
                  >
                    <span>
                      {new Date(i.scheduledAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <StatusBadge status={i.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                Listing Price
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(property.price)}
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={property.status} />
            </div>
            {property.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Listed</span>
                <span className="text-sm font-medium">
                  {formatDate(property.createdAt)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Images</span>
              <span className="text-sm font-medium">{images.length} / 4</span>
            </div>
          </div>
        </div>
      </div>

      <PropertyFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        editingProperty={property}
        onSaved={load}
      />
    </div>
  );
}
