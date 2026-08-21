import { apiFetch, IS_MOCK } from "./client";
import { delay, sales, properties } from "./mock-store";
import type { Customer } from "./types";

/**
 * There's no dedicated `customers` table in the schema — buyer info lives directly on
 * `sales`. We derive one customer record per unique buyer by grouping sales on email.
 */
function deriveCustomers(): Customer[] {
  const byEmail = new Map<string, Customer>();

  for (const sale of sales) {
    const property = properties.find((p) => p.id === sale.propertyId);
    const key = sale.buyerEmail.toLowerCase();
    const existing = byEmail.get(key);

    if (existing) {
      existing.totalSpent += sale.totalAmount;
      existing.saleCount += 1;
      if (!existing.saleTypes.includes(sale.saleType)) existing.saleTypes.push(sale.saleType);
      if (property && !existing.properties.includes(property.title)) {
        existing.properties.push(property.title);
      }
      if (sale.createdAt > existing.lastPurchaseDate) existing.lastPurchaseDate = sale.createdAt;
    } else {
      byEmail.set(key, {
        key,
        name: sale.buyerName,
        email: sale.buyerEmail,
        phone: sale.buyerPhone,
        totalSpent: sale.totalAmount,
        saleCount: 1,
        saleTypes: [sale.saleType],
        properties: property ? [property.title] : [],
        lastPurchaseDate: sale.createdAt,
      });
    }
  }

  return [...byEmail.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}

export interface CustomerFilter {
  search?: string;
  saleType?: "OUTRIGHT" | "INSTALLMENT";
}

export async function listCustomers(filter: CustomerFilter = {}): Promise<Customer[]> {
  if (IS_MOCK) {
    await delay();
    const search = filter.search?.trim().toLowerCase();
    return deriveCustomers()
      .filter((c) => !filter.saleType || c.saleTypes.includes(filter.saleType))
      .filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search),
      );
  }
  return apiFetch<Customer[]>("/customers");
}
