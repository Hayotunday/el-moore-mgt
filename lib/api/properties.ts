import { apiFetch, IS_MOCK } from "./client";
import { delay, properties, sales, uid } from "./mock-store";
import type { Property, PropertyStatus, Sale } from "./types";

export interface PropertyWithSale extends Property {
  sale: Sale | null;
}

function joinSale(property: Property): PropertyWithSale {
  const sale = sales.find((s) => s.propertyId === property.id) ?? null;
  return { ...property, sale };
}

export async function listProperties(): Promise<PropertyWithSale[]> {
  if (IS_MOCK) {
    await delay();
    return properties.map(joinSale);
  }
  return apiFetch<PropertyWithSale[]>("/properties");
}

export async function createProperty(input: {
  title: string;
  location: string;
  type: string;
  price: number;
  status: PropertyStatus;
}): Promise<Property> {
  if (IS_MOCK) {
    await delay(400);
    const newProperty: Property = {
      id: uid("prop"),
      createdAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    properties.push(newProperty);
    return { ...newProperty };
  }
  return apiFetch<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateProperty(
  id: string,
  input: Partial<Pick<Property, "title" | "location" | "type" | "price" | "status">>,
): Promise<Property> {
  if (IS_MOCK) {
    await delay(300);
    const property = properties.find((p) => p.id === id);
    if (!property) throw new Error("Property not found");
    Object.assign(property, input);
    return { ...property };
  }
  return apiFetch<Property>(`/properties/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProperty(id: string): Promise<void> {
  if (IS_MOCK) {
    await delay(300);
    const idx = properties.findIndex((p) => p.id === id);
    if (idx !== -1) properties.splice(idx, 1);
    return;
  }
  await apiFetch<void>(`/properties/${id}`, { method: "DELETE" });
}
