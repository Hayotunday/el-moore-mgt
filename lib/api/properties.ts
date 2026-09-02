import { apiFetch, toQueryString, uploadToPresignedUrl } from "./client";
import type { Property, PropertyImage, PropertyStatus, Sale } from "./types";

export interface PropertyWithSale extends Property {
  sale: Sale | null;
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

export async function listProperties(status?: PropertyStatus): Promise<Property[]> {
  return apiFetch<Property[]>(`/properties${toQueryString({ status })}`);
}

/**
 * Not wired to any page yet — the Properties page currently composes its stats and table
 * from `listProperties()` + `joinSaleToProperties()`, which already works. This
 * purpose-built endpoint could replace that, but its response shape isn't documented and
 * hasn't been verified against a live authenticated call.
 */
export async function getPropertiesDashboard(params: {
  search?: string;
  status?: PropertyStatus;
  limit?: number;
  offset?: number;
}): Promise<unknown> {
  return apiFetch(
    `/properties/dashboard${toQueryString({
      search: params.search,
      status: params.status,
      limit: params.limit ? String(params.limit) : undefined,
      offset: params.offset ? String(params.offset) : undefined,
    })}`,
  );
}

export async function listPublicProperties(): Promise<Property[]> {
  return apiFetch<Property[]>("/properties/public");
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
  return apiFetch<Property>("/properties", { method: "POST", body: JSON.stringify(input) });
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

export async function listPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  return apiFetch<PropertyImage[]>(`/properties/${propertyId}/images`);
}

/** OFFICE_ADMIN only. Uploads a file to R2 via a presigned URL, then confirms it. */
export async function uploadPropertyImage(propertyId: string, file: File): Promise<PropertyImage> {
  const { uploadUrl, imageId } = await apiFetch<{ uploadUrl: string; imageId: string }>(
    `/properties/${propertyId}/images`,
    { method: "POST", body: JSON.stringify({ filename: file.name, contentType: file.type }) },
  );
  await uploadToPresignedUrl(uploadUrl, file);
  return apiFetch<PropertyImage>(`/properties/${propertyId}/images/${imageId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ imageUrl: uploadUrl.split("?")[0] }),
  });
}

/** OFFICE_ADMIN only. */
export async function setPrimaryPropertyImage(propertyId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/properties/${propertyId}/images/${imageId}/set-primary`, {
    method: "PATCH",
  });
}

/** OFFICE_ADMIN only. */
export async function removePropertyImage(propertyId: string, imageId: string): Promise<void> {
  await apiFetch<void>(`/properties/${propertyId}/images/${imageId}`, { method: "DELETE" });
}
