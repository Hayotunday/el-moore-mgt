"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
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
  createProperty,
  updateProperty,
  listPropertyImages,
  uploadPropertyImage,
  setPrimaryPropertyImage,
  removePropertyImage,
} from "@/lib/api/properties";
import type { Property, PropertyImage, PropertyStatus } from "@/lib/api/types";

const MAX_IMAGES = 6;
const EMPTY_FORM = {
  title: "",
  location: "",
  price: "",
  status: "AVAILABLE" as PropertyStatus,
};

interface PropertyFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProperty: Property | null;
  onSaved: () => void;
}

export default function PropertyFormDrawer({
  open,
  onOpenChange,
  editingProperty,
  onSaved,
}: PropertyFormDrawerProps) {
  const [step, setStep] = useState<"details" | "images">("details");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep("details");
    if (editingProperty) {
      setForm({
        title: editingProperty.title,
        location: editingProperty.location,
        price: editingProperty.price,
        status: editingProperty.status,
      });
      setPropertyId(editingProperty.id);
    } else {
      setForm(EMPTY_FORM);
      setPropertyId(null);
      setImages([]);
    }
  }, [open, editingProperty]);

  const loadImages = async (id: string) => {
    setLoadingImages(true);
    try {
      setImages(await listPropertyImages(id));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load images.",
      );
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (open && editingProperty && propertyId) {
      loadImages(propertyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingProperty, propertyId]);

  const handleSaveDetails = async (goToImages: boolean) => {
    if (!form.title || !form.location || !form.price) {
      toast.error("Title, location and price are required.");
      return;
    }
    setSaving(true);
    try {
      if (propertyId) {
        await updateProperty(propertyId, form);
        toast.success("Property updated.");
        if (goToImages) {
          setStep("images");
          await loadImages(propertyId);
        } else {
          onOpenChange(false);
          onSaved();
        }
      } else {
        const created = await createProperty(form);
        toast.success("Property added to inventory.");
        setPropertyId(created.id);
        setStep("images");
        onSaved();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save property.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file || !propertyId) return;
    if (images.length >= MAX_IMAGES) {
      toast.error(`You can only add up to ${MAX_IMAGES} images per property.`);
      return;
    }
    setUploading(true);
    try {
      await uploadPropertyImage(propertyId, file);
      toast.success("Image uploaded.");
      await loadImages(propertyId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not upload image.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!propertyId) return;
    setBusyImageId(imageId);
    try {
      await setPrimaryPropertyImage(propertyId, imageId);
      await loadImages(propertyId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not set primary image.",
      );
    } finally {
      setBusyImageId(null);
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!propertyId) return;
    setBusyImageId(imageId);
    try {
      await removePropertyImage(propertyId, imageId);
      toast.success("Image removed.");
      await loadImages(propertyId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove image.",
      );
    } finally {
      setBusyImageId(null);
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    onSaved();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {step === "details"
              ? editingProperty
                ? "Edit Property"
                : "Add Property"
              : "Property Images"}
          </DrawerTitle>
          <DrawerDescription>
            {step === "details"
              ? "Title, location, price and current status."
              : `Up to ${MAX_IMAGES} photos. The first one uploaded is the primary listing image.`}
          </DrawerDescription>
        </DrawerHeader>

        {step === "details" ? (
          <>
            <DrawerBody className="space-y-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="4-Bed Terrace Duplex, Gwarinpa"
                />
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="Gwarinpa, Abuja"
                />
                <span className="text-xs text-muted-foreground">
                  Note: City, State. e.g. Gwarinpa, Abuja
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, status: v as PropertyStatus }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                      <SelectItem value="SOLD">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Price (₦)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="220000000"
                  />
                </div>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {editingProperty && (
                <Button
                  variant="outline"
                  onClick={() => handleSaveDetails(false)}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save & Close"}
                </Button>
              )}
              <Button onClick={() => handleSaveDetails(true)} disabled={saving}>
                {saving
                  ? "Saving…"
                  : editingProperty
                    ? "Save & Manage Images"
                    : "Continue to Images →"}
              </Button>
            </DrawerFooter>
          </>
        ) : (
          <>
            <DrawerBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-4/3 rounded-md overflow-hidden border border-border bg-muted"
                  >
                    {image.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.imageUrl}
                        alt="Property"
                        className="w-full h-full object-cover"
                      />
                    )}
                    {image.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 bg-gold text-secondary-foreground text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                      {!image.isPrimary && (
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          disabled={busyImageId === image.id}
                          onClick={() => handleSetPrimary(image.id)}
                          title="Set as primary"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        disabled={busyImageId === image.id}
                        onClick={() => handleRemoveImage(image.id)}
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <label className="aspect-4/3 rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-5 w-5" />
                    )}
                    <span className="text-xs font-medium">
                      {uploading ? "Uploading…" : "Add image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        handleUpload(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              {loadingImages && (
                <p className="text-xs text-muted-foreground">Loading images…</p>
              )}
              {!loadingImages && images.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No images yet — add up to {MAX_IMAGES} to showcase this
                  listing.
                </p>
              )}
            </DrawerBody>
            <DrawerFooter>
              {!editingProperty && (
                <Button variant="outline" onClick={() => setStep("details")}>
                  ← Back
                </Button>
              )}
              <Button onClick={handleFinish}>Done</Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
