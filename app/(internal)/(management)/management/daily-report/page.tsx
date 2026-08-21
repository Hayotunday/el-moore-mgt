"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Pencil } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/management/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { getTodayReport, listReports, submitReport } from "@/lib/api/daily-reports";
import type { DailyTaskReport } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export default function DailyReportPage() {
  const { user } = useAuth();
  const [today, setToday] = useState<DailyTaskReport | null>(null);
  const [history, setHistory] = useState<DailyTaskReport[]>([]);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [record, all] = await Promise.all([getTodayReport(user.id), listReports(user.id)]);
    setToday(record);
    setHistory(all);
    if (record) setContent(record.content);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!user || !content.trim()) {
      toast.error("Write something before submitting.");
      return;
    }
    setSaving(true);
    try {
      await submitReport({ staffId: user.id, staffName: user.name, content: content.trim() });
      toast.success(today ? "Report updated." : "Report submitted.");
      setEditing(false);
      await load();
    } catch {
      toast.error("Could not submit report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Daily Report" subtitle="Log what you worked on today — one entry per day." />

      <div className="rounded-md bg-card p-6 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.08)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold text-foreground">Today&apos;s Report</h2>
          </div>
          {today && !editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          )}
        </div>

        {today && !editing ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{today.content}</p>
        ) : (
          <div className="space-y-3">
            <Textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you work on today?"
            />
            <div className="flex gap-2 justify-end">
              {editing && (
                <Button variant="outline" onClick={() => { setEditing(false); setContent(today?.content ?? ""); }}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : today ? "Update Report" : "Submit Report"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Your Report History</h2>
        <div className="space-y-4">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">No previous reports yet.</p>
          )}
          {history
            .filter((r) => r.id !== today?.id)
            .map((report) => (
              <div key={report.id} className="rounded-md bg-card p-5 shadow-[0_12px_40px_-8px_rgba(27,28,26,0.06)]">
                <p className="text-xs text-muted-foreground mb-2">{formatDate(report.date)}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.content}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
