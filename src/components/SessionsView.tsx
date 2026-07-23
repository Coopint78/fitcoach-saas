"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, CheckCircle, X, ChevronLeft, ChevronRight, BanIcon, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

type BlockedSlot = {
  id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
};

type Client = { id: string; name: string; email: string };
type Session = {
  id: string; scheduled_at: string; duration_minutes: number;
  title: string | null; notes: string | null; status: string;
  client: Client;
};

type Props = { clients: Client[] };

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-700",
};

export default function SessionsView({ clients }: Props) {
  const { t, lang } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [form, setForm] = useState({
    client_id: "", scheduled_at: "", duration_minutes: "60", title: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Availability exceptions
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showBlockedForm, setShowBlockedForm] = useState(false);
  const [blockedForm, setBlockedForm] = useState({ blocked_date: "", start_time: "", end_time: "", note: "", allDay: true });
  const [savingBlocked, setSavingBlocked] = useState(false);

  const STATUS_LABELS: Record<string, string> = {
    scheduled: t("sessions", "statusScheduled"),
    completed: t("sessions", "statusCompleted"),
    cancelled: t("sessions", "statusCancelled"),
    no_show: t("sessions", "statusNoShow"),
  };

  const getWeekRange = useCallback(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
  }, [weekOffset]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { from, to } = getWeekRange();
    const res = await fetch(`/api/sessions?from=${from.toISOString()}&to=${to.toISOString()}`);
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [getWeekRange]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const fetchBlocked = useCallback(async () => {
    const res = await fetch("/api/sessions/blocked");
    const data = await res.json();
    setBlockedSlots(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { fetchBlocked(); }, [fetchBlocked]);

  async function addBlockedSlot(e: React.FormEvent) {
    e.preventDefault();
    setSavingBlocked(true);
    const body: Record<string, string> = { blocked_date: blockedForm.blocked_date };
    if (!blockedForm.allDay && blockedForm.start_time) body.start_time = blockedForm.start_time;
    if (!blockedForm.allDay && blockedForm.end_time) body.end_time = blockedForm.end_time;
    if (blockedForm.note) body.note = blockedForm.note;
    const res = await fetch("/api/sessions/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(t("sessions", "blockedAdded"));
      setBlockedForm({ blocked_date: "", start_time: "", end_time: "", note: "", allDay: true });
      setShowBlockedForm(false);
      fetchBlocked();
    } else {
      toast.error(t("sessions", "blockedErrorAdd"));
    }
    setSavingBlocked(false);
  }

  async function deleteBlockedSlot(id: string) {
    if (!confirm(t("sessions", "blockedConfirmDelete"))) return;
    const res = await fetch(`/api/sessions/blocked?id=${id}`, { method: "DELETE" });
    if (res.ok) { toast.success(t("sessions", "blockedDeleted")); fetchBlocked(); }
    else toast.error(t("sessions", "blockedErrorDelete"));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration_minutes: Number(form.duration_minutes) }),
    });
    if (res.ok) {
      toast.success(t("sessions", "sessionCreated"));
      setShowNew(false);
      setForm({ client_id: "", scheduled_at: "", duration_minutes: "60", title: "", notes: "" });
      fetchSessions();
    } else {
      toast.error(t("sessions", "errorCreate"));
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success(t("sessions", "statusUpdated")); fetchSessions(); }
    else toast.error(t("sessions", "errorUpdate"));
  }

  async function deleteSession(id: string) {
    if (!confirm(t("sessions", "confirmDelete"))) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success(t("sessions", "sessionDeleted")); fetchSessions(); }
    else toast.error(t("sessions", "errorDelete"));
  }

  const { from, to } = getWeekRange();
  const weekLabel = `${from.toLocaleDateString(lang, { day: "numeric", month: "short" })} — ${to.toLocaleDateString(lang, { day: "numeric", month: "short", year: "numeric" })}`;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("sessions", "title")}</h1>
          <p className="text-muted-foreground text-sm">{t("sessions", "subtitle")}</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t("sessions", "newSession")}
        </Button>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium min-w-48 text-center">{weekLabel}</span>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
        {weekOffset !== 0 && <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>{t("sessions", "today")}</Button>}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySessions = sessions.filter(s => {
            const d = new Date(s.scheduled_at);
            return d.toDateString() === day.toDateString();
          });
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className={`rounded-xl border p-2 min-h-28 ${isToday ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <p className={`text-xs font-semibold mb-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                {day.toLocaleDateString(lang, { weekday: "short" })} {day.getDate()}
              </p>
              <div className="space-y-1">
                {daySessions.map(s => (
                  <div key={s.id} className="text-xs bg-blue-100 text-blue-800 rounded p-1 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => { /* could open detail modal */ }}>
                    <p className="font-semibold truncate">{s.client.name}</p>
                    <p className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(s.scheduled_at).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session list */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t("sessions", "weekSessions")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("sessions", "loading")}</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("sessions", "noSessions")}</p>
            </div>
          ) : (
            sessions.map((s) => {
              const date = new Date(s.scheduled_at);
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{date.toLocaleDateString(lang, { month: "short" }).toUpperCase()}</span>
                    <span className="text-sm font-bold text-primary">{date.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })} · {s.duration_minutes} min
                      {s.title && ` · ${s.title}`}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </Badge>
                  <div className="flex gap-1">
                    {s.status === "scheduled" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                        onClick={() => updateStatus(s.id, "completed")} title={t("sessions", "markCompleted")}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => deleteSession(s.id)} title={t("sessions", "delete")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ── Availability exceptions ─────────────────────────── */}
      <Card>
        <CardHeader>
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowBlocked(v => !v)}
          >
            <div className="flex items-center gap-2">
              <BanIcon className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-base">{t("sessions", "blockedTitle")}</CardTitle>
              {blockedSlots.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 text-xs">{blockedSlots.length}</Badge>
              )}
            </div>
            {showBlocked ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </CardHeader>

        {showBlocked && (
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{t("sessions", "blockedSubtitle")}</p>

            {/* Existing exceptions */}
            {blockedSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">{t("sessions", "blockedEmpty")}</p>
            ) : (
              <div className="space-y-2">
                {blockedSlots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-3 p-3 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                    <BanIcon className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {new Date(slot.blocked_date + "T12:00:00").toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.start_time ? `${slot.start_time.slice(0, 5)} – ${slot.end_time?.slice(0, 5) ?? "?"}` : t("sessions", "blockedAllDay")}
                        {slot.note && ` · ${slot.note}`}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => deleteBlockedSlot(slot.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add form */}
            {showBlockedForm ? (
              <form onSubmit={addBlockedSlot} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                <div className="space-y-1">
                  <Label>{t("sessions", "blockedDate")}</Label>
                  <Input type="date" required value={blockedForm.blocked_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setBlockedForm(f => ({ ...f, blocked_date: e.target.value }))} />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="allday"
                    type="checkbox"
                    checked={blockedForm.allDay}
                    onChange={e => setBlockedForm(f => ({ ...f, allDay: e.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="allday" className="cursor-pointer">{t("sessions", "blockedAllDay")}</Label>
                </div>

                {!blockedForm.allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>{t("sessions", "blockedStartTime")}</Label>
                      <Input type="time" value={blockedForm.start_time}
                        onChange={e => setBlockedForm(f => ({ ...f, start_time: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("sessions", "blockedEndTime")}</Label>
                      <Input type="time" value={blockedForm.end_time}
                        onChange={e => setBlockedForm(f => ({ ...f, end_time: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label>{t("sessions", "blockedNote")}</Label>
                  <Input value={blockedForm.note} placeholder={t("sessions", "blockedNote")}
                    onChange={e => setBlockedForm(f => ({ ...f, note: e.target.value }))} />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={savingBlocked || !blockedForm.blocked_date} size="sm" className="flex-1">
                    {savingBlocked ? "…" : t("sessions", "blockedSave")}
                  </Button>
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setShowBlockedForm(false)}>{t("sessions", "blockedCancel")}</Button>
                </div>
              </form>
            ) : (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowBlockedForm(true)}>
                <Plus className="h-4 w-4" /> {t("sessions", "blockedAdd")}
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* New session dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("sessions", "newSessionTitle")}</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("sessions", "clientLabel")}</Label>
              <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder={t("sessions", "clientPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>{t("sessions", "dateLabel")}</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
            </div>
            <div className="space-y-1">
              <Label>{t("sessions", "durationLabel")}</Label>
              <Input type="number" min="15" max="240" step="15" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>{t("sessions", "titleLabel")}</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t("sessions", "titlePlaceholder")} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || !form.client_id || !form.scheduled_at} className="flex-1">
                {saving ? t("sessions", "creating") : t("sessions", "createBtn")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>{t("sessions", "cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
