"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Mail, Cake, CreditCard, MapPinned, Send, Info } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import StatCard from "@/components/management/stat-card";
import StatusBadge from "@/components/management/status-badge";
import SearchFilterBar from "@/components/management/search-filter-bar";
import {
  DataTable,
  DataTableHead,
  DataTableHeadCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableEmpty,
} from "@/components/management/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  listSubscribers,
  listCampaigns,
  createAndSendCampaign,
  getAutomatedGreetingSettings,
  toggleAutomatedGreeting,
} from "@/lib/api/newsletter";
import { getNotificationHistory } from "@/lib/api/notifications";
import type {
  AutomatedGreetingSettings,
  NewsletterCampaign,
  NewsletterSubscriber,
  NotificationLogEntry,
} from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [notifLog, setNotifLog] = useState<NotificationLogEntry[]>([]);
  const [greetings, setGreetings] = useState<AutomatedGreetingSettings | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [subs, camps, log, settings] = await Promise.all([
      listSubscribers(),
      listCampaigns(),
      getNotificationHistory(),
      getAutomatedGreetingSettings(),
    ]);
    setSubscribers(subs);
    setCampaigns(camps);
    setNotifLog(log);
    setGreetings(settings);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeSubscribers = subscribers.filter((s) => !s.unsubscribed);

  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearch.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, subscriberSearch]);

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error("Subject and body are required.");
      return;
    }
    setSending(true);
    try {
      await createAndSendCampaign({ subject, body });
      toast.success(`Sent to ${activeSubscribers.length} active subscribers.`);
      setSubject("");
      setBody("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send campaign.");
    } finally {
      setSending(false);
    }
  };

  const handleGreetingToggle = async (key: keyof AutomatedGreetingSettings, value: boolean) => {
    setGreetings((prev) => (prev ? { ...prev, [key]: value } : prev));
    try {
      await toggleAutomatedGreeting(key, value);
    } catch {
      toast.error("Could not update setting.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Newsletter & Communication"
        subtitle="Bulk mail, automated greetings, and the notification delivery log."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Active Subscribers" value={activeSubscribers.length} icon={<Mail className="h-6 w-6" />} />
        <StatCard label="Campaigns Sent" value={campaigns.length} icon={<Send className="h-6 w-6" />} variant="gold" />
        <StatCard
          label="Auto-Greetings Enabled"
          value={greetings ? Object.values(greetings).filter(Boolean).length : "…"}
          sublabel="of 3 event triggers"
          icon={<Cake className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Compose Campaign</h2>
            <p className="text-sm text-muted-foreground">
              Sends to every active subscriber — the API doesn&apos;t yet support targeting a
              custom recipient list.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="New Year, New Portfolio"
            />
          </div>
          <div className="grid gap-2">
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Our latest premium investment opportunities…"
            />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? "Sending…" : `Send to ${activeSubscribers.length} Subscribers`}
          </Button>
        </div>

        {/* Subscriber directory */}
        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Subscribers</h2>
            <p className="text-sm text-muted-foreground">Who will receive the next campaign.</p>
          </div>
          <SearchFilterBar
            searchValue={subscriberSearch}
            onSearchChange={setSubscriberSearch}
            searchPlaceholder="Search by email…"
          />
          <div className="max-h-56 overflow-y-auto rounded-sm bg-muted/30 divide-y divide-border/40">
            {filteredSubscribers.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No matching subscribers.</p>
            )}
            {filteredSubscribers.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-foreground truncate">{s.email}</span>
                <StatusBadge status={s.unsubscribed ? "UNSUBSCRIBED" : "ACTIVE"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automated Greetings */}
      <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-5">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-gold mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Automated Greetings</h2>
            <p className="text-sm text-muted-foreground">
              Event-triggered emails and WhatsApp messages. Preview only — the live backend
              doesn&apos;t expose an endpoint to configure these triggers yet, so toggles here
              are local.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              key: "birthday" as const,
              icon: Cake,
              title: "Client Birthdays",
              body: "Automated email on each client's birthday.",
            },
            {
              key: "paymentReminder" as const,
              icon: CreditCard,
              title: "Payment Reminders",
              body: "Email nudge ahead of an upcoming installment due date.",
            },
            {
              key: "inspectionFollowup" as const,
              icon: MapPinned,
              title: "Inspection Follow-ups",
              body: "WhatsApp message after a scheduled site inspection.",
            },
          ].map(({ key, icon: Icon, title, body }) => (
            <div key={key} className="flex items-start justify-between gap-3 rounded-sm bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{body}</p>
                </div>
              </div>
              <Switch
                checked={greetings?.[key] ?? false}
                onCheckedChange={(v) => handleGreetingToggle(key, v)}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Notification Delivery Log
          </p>
          <DataTable>
            <DataTableHead>
              <DataTableHeadCell>Channel</DataTableHeadCell>
              <DataTableHeadCell>Trigger</DataTableHeadCell>
              <DataTableHeadCell>Recipient</DataTableHeadCell>
              <DataTableHeadCell align="center">Status</DataTableHeadCell>
              <DataTableHeadCell align="right">Sent</DataTableHeadCell>
            </DataTableHead>
            <DataTableBody>
              {notifLog.length === 0 && <DataTableEmpty colSpan={5} />}
              {notifLog.map((entry, idx) => (
                <DataTableRow key={entry.id} index={idx}>
                  <DataTableCell>{entry.channel}</DataTableCell>
                  <DataTableCell>{entry.triggerType?.replace(/_/g, " ") ?? "—"}</DataTableCell>
                  <DataTableCell>{entry.recipient}</DataTableCell>
                  <DataTableCell align="center">
                    <StatusBadge status={entry.status} />
                  </DataTableCell>
                  <DataTableCell align="right">{formatDate(entry.sentAt)}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </div>
      </div>

      {/* Campaign history */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Campaign History</h2>
        <DataTable>
          <DataTableHead>
            <DataTableHeadCell>Subject</DataTableHeadCell>
            <DataTableHeadCell>Message</DataTableHeadCell>
            <DataTableHeadCell align="right">Sent</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {campaigns.length === 0 && <DataTableEmpty colSpan={3} />}
            {campaigns.map((c, idx) => (
              <DataTableRow key={c.id} index={idx}>
                <DataTableCell className="font-medium">{c.subject}</DataTableCell>
                <DataTableCell className="max-w-md truncate">{c.body}</DataTableCell>
                <DataTableCell align="right">{c.sentAt ? formatDate(c.sentAt) : "Draft"}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
