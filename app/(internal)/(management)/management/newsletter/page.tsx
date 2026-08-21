"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Mail, Cake, CreditCard, MapPinned, Send } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  listSubscribers,
  listCampaigns,
  sendCampaign,
  listNotificationLog,
  getAutomatedGreetingSettings,
  toggleAutomatedGreeting,
} from "@/lib/api/newsletter";
import type {
  AutomatedGreetingSettings,
  NewsletterCampaign,
  NewsletterSubscriber,
  NotificationLogEntry,
} from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function NewsletterPage() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [notifLog, setNotifLog] = useState<NotificationLogEntry[]>([]);
  const [greetings, setGreetings] = useState<AutomatedGreetingSettings | null>(null);

  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkSending, setBulkSending] = useState(false);

  const [customOpen, setCustomOpen] = useState(false);
  const [customSearch, setCustomSearch] = useState("");
  const [customTypeFilter, setCustomTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [customSending, setCustomSending] = useState(false);

  const load = useCallback(async () => {
    const [subs, camps, log, settings] = await Promise.all([
      listSubscribers(),
      listCampaigns(),
      listNotificationLog(),
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
    const q = customSearch.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (customTypeFilter !== "all" && s.type !== customTypeFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [subscribers, customSearch, customTypeFilter]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkSend = async () => {
    if (!bulkSubject || !bulkBody || !user) {
      toast.error("Subject and body are required.");
      return;
    }
    setBulkSending(true);
    try {
      await sendCampaign({
        subject: bulkSubject,
        body: bulkBody,
        audience: "All Subscribers",
        recipientCount: activeSubscribers.length,
        createdById: user.id,
        createdByName: user.name,
      });
      toast.success(`Sent to ${activeSubscribers.length} subscribers.`);
      setBulkSubject("");
      setBulkBody("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send campaign.");
    } finally {
      setBulkSending(false);
    }
  };

  const handleCustomSend = async () => {
    if (!customSubject || !customBody || selectedIds.size === 0 || !user) {
      toast.error("Select recipients and fill in subject & body.");
      return;
    }
    setCustomSending(true);
    try {
      await sendCampaign({
        subject: customSubject,
        body: customBody,
        audience: `Custom — ${selectedIds.size} recipient${selectedIds.size > 1 ? "s" : ""}`,
        recipientCount: selectedIds.size,
        createdById: user.id,
        createdByName: user.name,
      });
      toast.success(`Sent to ${selectedIds.size} selected recipients.`);
      setCustomOpen(false);
      setCustomSubject("");
      setCustomBody("");
      setSelectedIds(new Set());
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send email.");
    } finally {
      setCustomSending(false);
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
        subtitle="Bulk mail, automated greetings, and one-off custom emails to customers."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Active Subscribers" value={activeSubscribers.length} icon={<Mail className="h-6 w-6" />} />
        <StatCard label="Campaigns Sent" value={campaigns.length} icon={<Send className="h-6 w-6" />} variant="gold" />
        <StatCard
          label="Auto-Greetings Enabled"
          value={
            greetings ? Object.values(greetings).filter(Boolean).length : "…"
          }
          sublabel="of 3 event triggers"
          icon={<Cake className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk composer */}
        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bulk Broadcast</h2>
            <p className="text-sm text-muted-foreground">
              Send to every active subscriber — customers, marketers and site subscribers.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Subject</Label>
            <Input
              value={bulkSubject}
              onChange={(e) => setBulkSubject(e.target.value)}
              placeholder="New Year, New Portfolio"
            />
          </div>
          <div className="grid gap-2">
            <Label>Message</Label>
            <Textarea
              rows={5}
              value={bulkBody}
              onChange={(e) => setBulkBody(e.target.value)}
              placeholder="Our latest premium investment opportunities…"
            />
          </div>
          <Button onClick={handleBulkSend} disabled={bulkSending} className="w-full">
            {bulkSending ? "Sending…" : `Send to ${activeSubscribers.length} Subscribers`}
          </Button>
        </div>

        {/* Custom composer trigger */}
        <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Custom Email</h2>
            <p className="text-sm text-muted-foreground">
              Search and hand-pick exactly who should receive this one.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Filter subscribers by type, select individuals, then compose a message just for
            them — useful for targeted follow-ups outside the automated triggers.
          </p>
          <Button variant="outline" onClick={() => setCustomOpen(true)} className="w-full">
            Compose Custom Email
          </Button>
        </div>
      </div>

      {/* Automated Greetings */}
      <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)] space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Automated Greetings</h2>
          <p className="text-sm text-muted-foreground">
            Event-triggered emails and WhatsApp messages — no manual sending required.
          </p>
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
            Recent Trigger Log
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
                  <DataTableCell>{entry.triggerType.replace(/_/g, " ")}</DataTableCell>
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
            <DataTableHeadCell>Audience</DataTableHeadCell>
            <DataTableHeadCell align="center">Recipients</DataTableHeadCell>
            <DataTableHeadCell>Sent By</DataTableHeadCell>
            <DataTableHeadCell align="right">Sent</DataTableHeadCell>
          </DataTableHead>
          <DataTableBody>
            {campaigns.length === 0 && <DataTableEmpty colSpan={5} />}
            {campaigns.map((c, idx) => (
              <DataTableRow key={c.id} index={idx}>
                <DataTableCell>{c.subject}</DataTableCell>
                <DataTableCell>{c.audience}</DataTableCell>
                <DataTableCell align="center">{c.recipientCount}</DataTableCell>
                <DataTableCell>{c.createdByName}</DataTableCell>
                <DataTableCell align="right">{formatDate(c.sentAt)}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Custom Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <SearchFilterBar
              searchValue={customSearch}
              onSearchChange={setCustomSearch}
              searchPlaceholder="Search recipients by name or email…"
              filters={[
                {
                  key: "type",
                  label: "Type",
                  value: customTypeFilter,
                  onChange: setCustomTypeFilter,
                  options: [
                    { label: "Customers", value: "CUSTOMER" },
                    { label: "Marketers", value: "MARKETER" },
                    { label: "Subscribers", value: "SUBSCRIBER" },
                  ],
                },
              ]}
            />
            <div className="max-h-48 overflow-y-auto rounded-sm bg-muted/30 divide-y divide-border/40">
              {filteredSubscribers.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No matching recipients.</p>
              )}
              {filteredSubscribers.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/60"
                >
                  <Checkbox
                    checked={selectedIds.has(s.id)}
                    onCheckedChange={() => toggleSelected(s.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.type}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{selectedIds.size} recipient(s) selected</p>

            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Message</Label>
              <Textarea rows={4} value={customBody} onChange={(e) => setCustomBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomSend} disabled={customSending || selectedIds.size === 0}>
              {customSending ? "Sending…" : `Send to ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
