import {
  apiFetch,
  toQueryString,
  uploadToPresignedUrl,
  toPublicR2Url,
  R2_PUBLIC_BASE_URL,
} from "./client";
import type { Property, PropertyImage, PropertyStatus, Sale, SaleType } from "./types";

export interface PropertyWithSale extends Property {
  sale: Sale | null;
}

export interface DashboardProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  status: PropertyStatus;
  firstName: string | null;
  lastName: string | null;
  saleType: SaleType | null;
  saleDate: string | null;
}

export interface PropertiesDashboardSummary {
  totalProperties: number;
  sold: number;
  totalPortfolioValue: number;
}

export interface PropertiesDashboardResponse {
  summary: PropertiesDashboardSummary;
  properties: DashboardProperty[];
}

/** GET /properties has no join on the live API — cross-reference sales client-side. */
export function joinSaleToProperties(
  propertyList: Property[],
  saleList: Sale[],
): PropertyWithSale[] {
  return propertyList.map((property) => ({
    ...property,
    sale: saleList.find((s) => s.propertyId === property.id) ?? null,
  }));
}

export async function listProperties(
  status?: PropertyStatus,
): Promise<Property[]> {
  return apiFetch<Property[]>(`/properties${toQueryString({ status })}`);
}

export async function getPropertiesDashboard(params?: {
  search?: string;
  status?: PropertyStatus;
  limit?: number;
  offset?: number;
}): Promise<PropertiesDashboardResponse> {
  return apiFetch<PropertiesDashboardResponse>(
    `/properties/dashboard${toQueryString({
      search: params?.search,
      status: params?.status,
      limit: params?.limit ? String(params.limit) : undefined,
      offset: params?.offset ? String(params.offset) : undefined,
    })}`,
  );
}

export async function listPublicProperties(): Promise<Property[]> {
  return apiFetch<Property[]>("/properties/public");
}

/** Best-effort primary photo for a property card — falls back to null so a
 * card can render a placeholder rather than fail the whole list. */
export async function getPrimaryImageUrl(
  propertyId: string,
): Promise<string | null> {
  try {
    const images = await listPropertyImages(propertyId);
    return (
      images.find((img) => img.isPrimary)?.imageUrl ??
      images[0]?.imageUrl ??
      null
    );
  } catch {
    return null;
  }
}

/** Batch-resolves a primary image per property — one call per property, run
 * concurrently, so a listing grid never blocks entirely on one bad image. */
export async function getPrimaryImages(
  propertyIds: string[],
): Promise<Map<string, string | null>> {
  const entries = await Promise.all(
    propertyIds.map(async (id) => [id, await getPrimaryImageUrl(id)] as const),
  );
  return new Map(entries);
}

export async function getProperty(id: string): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`);
}

/** OFFICE_ADMIN only. */
export async function createProperty(input: {
  title: string;
  location: string;
  price: string;
  status?: PropertyStatus;
}): Promise<Property> {
  return apiFetch<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** OFFICE_ADMIN only. */
export async function updateProperty(
  id: string,
  input: Partial<Pick<Property, "title" | "location" | "price" | "status">>,
): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** OFFICE_ADMIN only. */
export async function deleteProperty(id: string): Promise<void> {
  await apiFetch<void>(`/properties/${id}`, { method: "DELETE" });
}

export async function listPropertyImages(
  propertyId: string,
): Promise<PropertyImage[]> {
  return apiFetch<PropertyImage[]>(`/properties/${propertyId}/images`);
}

/** OFFICE_ADMIN only. Uploads a file to R2 via a presigned URL, then confirms it. */
export async function uploadPropertyImage(
  propertyId: string,
  file: File,
): Promise<PropertyImage> {
  const {
    uploadUrl,
    image: { id },
  } = await apiFetch<{
    uploadUrl: string;
    image: { id: string };
  }>(`/properties/${propertyId}/images`, {
    method: "POST",
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  await uploadToPresignedUrl(uploadUrl, file);
  return apiFetch<PropertyImage>(
    `/properties/${propertyId}/images/${id}/confirm`,
    {
      method: "POST",
      body: JSON.stringify({
        imageUrl: toPublicR2Url(uploadUrl, R2_PUBLIC_BASE_URL),
      }),
    },
  );
}

/** OFFICE_ADMIN only. */
export async function setPrimaryPropertyImage(
  propertyId: string,
  imageId: string,
): Promise<void> {
  await apiFetch<void>(
    `/properties/${propertyId}/images/${imageId}/set-primary`,
    {
      method: "PATCH",
    },
  );
}

/** OFFICE_ADMIN only. */
export async function removePropertyImage(
  propertyId: string,
  imageId: string,
): Promise<void> {
  await apiFetch<void>(`/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
  });
}

/** OFFICE_ADMIN only. Images uploaded (e.g. via a step-1 presigned-URL request)
 *  but never attached to a property — propertyId is null by definition here,
 *  unlike the normal PropertyImage shape. */
export async function listOrphanedImages(): Promise<
  (Omit<PropertyImage, "propertyId"> & { propertyId: null })[]
> {
  return apiFetch("/properties/images/orphaned");
}

/** OFFICE_ADMIN only. Attaches a previously-orphaned image to a property. */
export async function attachOrphanedImage(
  propertyId: string,
  imageId: string,
): Promise<PropertyImage> {
  return apiFetch<PropertyImage>(`/properties/${propertyId}/images/${imageId}/attach`, {
    method: "POST",
  });
}
