import { apiFetch, uploadToPresignedUrl } from "./client";
import { delay, automatedGreetingSettings } from "./mock-store";
import type { AutomatedGreetingSettings, NewsletterCampaign, NewsletterSubscriber } from "./types";

/** Public. */
export async function subscribe(email: string): Promise<void> {
  await apiFetch<void>("/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });
}

/** Public. */
export async function unsubscribe(email: string): Promise<void> {
  await apiFetch<void>("/newsletter/unsubscribe", { method: "POST", body: JSON.stringify({ email }) });
}

/** OFFICE_ADMIN only. */
export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  return apiFetch<NewsletterSubscriber[]>("/newsletter/subscribers");
}

/** OFFICE_ADMIN only. */
export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  return apiFetch<NewsletterCampaign[]>("/newsletter/campaigns");
}

/** OFFICE_ADMIN only. Creates a draft campaign. */
export async function createCampaign(input: { subject: string; body: string }): Promise<NewsletterCampaign> {
  return apiFetch<NewsletterCampaign>("/newsletter/campaigns", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * OFFICE_ADMIN only. Marks a campaign as sent — the API sends it to all active
 * subscribers server-side; there's no endpoint to target a custom recipient list.
 */
export async function sendCampaign(id: string): Promise<NewsletterCampaign> {
  return apiFetch<NewsletterCampaign>(`/newsletter/campaigns/${id}/send`, { method: "POST" });
}

/** Convenience: create + immediately send a campaign to all active subscribers. */
export async function createAndSendCampaign(input: {
  subject: string;
  body: string;
}): Promise<NewsletterCampaign> {
  const draft = await createCampaign(input);
  return sendCampaign(draft.id);
}

/** OFFICE_ADMIN only. */
export async function uploadCampaignCoverImage(id: string, file: File): Promise<string> {
  const { uploadUrl } = await apiFetch<{ uploadUrl: string }>(
    `/newsletter/campaigns/${id}/cover-image`,
    { method: "PATCH", body: JSON.stringify({ filename: file.name }) },
  );
  await uploadToPresignedUrl(uploadUrl, file);
  const coverImageUrl = uploadUrl.split("?")[0];
  await apiFetch<void>(`/newsletter/campaigns/${id}/cover-image/confirm`, {
    method: "POST",
    body: JSON.stringify({ coverImageUrl }),
  });
  return coverImageUrl;
}

// ── Automated greetings ──────────────────────────────────────────────────
// No endpoint exists on the live backend for configuring these triggers — this is a
// local preview only, always backed by the mock store.
export async function getAutomatedGreetingSettings(): Promise<AutomatedGreetingSettings> {
  await delay(150);
  return { ...automatedGreetingSettings };
}

export async function toggleAutomatedGreeting(
  key: keyof AutomatedGreetingSettings,
  value: boolean,
): Promise<AutomatedGreetingSettings> {
  await delay(250);
  automatedGreetingSettings[key] = value;
  return { ...automatedGreetingSettings };
}
