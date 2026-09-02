const REFERRAL_STORAGE_KEY = "el-moore-referral-code";

interface StoredReferral {
  code: string;
  capturedAt: string;
}

/**
 * Reads `?ref=` off the current URL (if present) and persists it to localStorage so it
 * survives across the visitor's later pages/sessions. Strips the param from the address
 * bar afterward so it doesn't linger or get re-shared. Most-recent-referrer wins.
 *
 * There's no backend endpoint yet that accepts this code (see lib/api/auth.ts /
 * lib/api/customers.ts — no referral field on any registration or customer DTO). The
 * only real attribution point today is CreateSaleDto.marketerId, entered by staff on
 * /management/sales. This just captures and stores the code so it's ready to use the
 * moment that changes.
 */
export function captureReferralFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const code = url.searchParams.get("ref");
  if (!code) return;

  const stored: StoredReferral = { code, capturedAt: new Date().toISOString() };
  window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(stored));

  url.searchParams.delete("ref");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as StoredReferral).code;
  } catch {
    return null;
  }
}

export function clearStoredReferralCode(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

/** A marketer's referral link is just their own user ID with a `?ref=` param — that's
 * exactly what CreateSaleDto.marketerId expects when a sale is eventually recorded. */
export function buildReferralLink(marketerId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?ref=${marketerId}`;
}
