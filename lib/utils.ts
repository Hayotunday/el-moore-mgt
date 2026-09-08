import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Call before opening a Radix Dialog/Drawer that's driven by external state
 * (no <DialogTrigger>/<DrawerTrigger>). Radix marks the rest of the page
 * aria-hidden as soon as the dialog mounts; if the button that was clicked
 * still holds focus at that instant, Chrome blocks the hide and logs
 * "Blocked aria-hidden on an element because its descendant retained focus."
 * Blurring synchronously in the click handler — before React even
 * re-renders — closes that race for good.
 */
export function blurActiveElement() {
  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })
}

/** Names come back from the backend split into parts (firstName/middleName/lastName)
 *  rather than one combined field — use this everywhere a full display name is needed. */
export function getFullName(person: {
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
}): string {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ")
}

/** First name + last initial, e.g. "Jane D." — for compact spaces like a nav bar. */
export function getShortName(person: { firstName?: string | null; lastName?: string | null }): string {
  if (!person.firstName) return ""
  return person.lastName ? `${person.firstName} ${person.lastName[0]}.` : person.firstName
}

/** Initials for an avatar badge, e.g. "JD" — falls back gracefully if a part is missing. */
export function getInitials(person: { firstName?: string | null; lastName?: string | null }): string {
  return [person.firstName?.[0], person.lastName?.[0]].filter(Boolean).join("").toUpperCase()
}
