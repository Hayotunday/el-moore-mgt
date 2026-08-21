import { apiFetch, IS_MOCK } from "./client";
import {
  delay,
  newsletterSubscribers,
  newsletterCampaigns,
  notificationLog,
  automatedGreetingSettings,
  uid,
} from "./mock-store";
import type {
  AutomatedGreetingSettings,
  NewsletterCampaign,
  NewsletterSubscriber,
  NotificationLogEntry,
} from "./types";

export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  if (IS_MOCK) {
    await delay();
    return [...newsletterSubscribers];
  }
  return apiFetch<NewsletterSubscriber[]>("/newsletter/subscribers");
}

export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  if (IS_MOCK) {
    await delay();
    return [...newsletterCampaigns].sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  }
  return apiFetch<NewsletterCampaign[]>("/newsletter/campaigns");
}

export async function sendCampaign(input: {
  subject: string;
  body: string;
  audience: string;
  recipientCount: number;
  createdById: string;
  createdByName: string;
}): Promise<NewsletterCampaign> {
  if (IS_MOCK) {
    await delay(700);
    const campaign: NewsletterCampaign = {
      id: uid("camp"),
      sentAt: new Date().toISOString().slice(0, 10),
      ...input,
    };
    newsletterCampaigns.unshift(campaign);
    return { ...campaign };
  }
  return apiFetch<NewsletterCampaign>("/newsletter/campaigns", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listNotificationLog(): Promise<NotificationLogEntry[]> {
  if (IS_MOCK) {
    await delay();
    return [...notificationLog].sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1));
  }
  return apiFetch<NotificationLogEntry[]>("/notifications/log");
}

export async function getAutomatedGreetingSettings(): Promise<AutomatedGreetingSettings> {
  if (IS_MOCK) {
    await delay(150);
    return { ...automatedGreetingSettings };
  }
  return apiFetch<AutomatedGreetingSettings>("/notifications/automated-greetings");
}

export async function toggleAutomatedGreeting(
  key: keyof AutomatedGreetingSettings,
  value: boolean,
): Promise<AutomatedGreetingSettings> {
  if (IS_MOCK) {
    await delay(250);
    automatedGreetingSettings[key] = value;
    return { ...automatedGreetingSettings };
  }
  return apiFetch<AutomatedGreetingSettings>("/notifications/automated-greetings", {
    method: "PATCH",
    body: JSON.stringify({ [key]: value }),
  });
}
