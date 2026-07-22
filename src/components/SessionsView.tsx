"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Confirmada", completed: "Completada", cancelled: "Cancelada", no_show: "No asistió",
};

export default function SessionsView({ clients }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const [form, setForm] = useState({
    client_id: "", scheduled_at: "", duration_minutes: "60", title: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration_minutes: Number(form.duration_minutes) }),
    });
    if (res.ok) {
      toast.success("Sesión creada");
      setShowNew(false);
      setForm({ client_id: "", scheduled_at: "", duration_minutes: "60", title: "", notes: "" });
      fetchSessions();
    } else {
      toast.error("Error al crear sesión");
    }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast.success("Estado actualizado"); fetchSessions(); }
    else toast.error("Error al actualizar");
  }

  async function deleteSession(id: string) {
    if (!confirm("¿Eliminar esta sesión?")) return;
    const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Sesión eliminada"); fetchSessions(); }
    else toast.error("Error al eliminar");
  }

  const { from, to } = getWeekRange();
  const weekLabel = `${from.toLocaleDateString("es", { day: "numeric", month: "short" })} — ${to.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}`;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesiones</h1>
          <p className="text-muted-foreground text-sm">Calendario de sesiones con clientes</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva sesión
        </Button>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm font-medium min-w-48 text-center">{weekLabel}</span>
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight className="h-4 w-4" /></Button>
        {weekOffset !== 0 && <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Hoy</Button>}
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
                {day.toLocaleDateString("es", { weekday: "short" })} {day.getDate()}
              </p>
              <div className="space-y-1">
                {daySessions.map(s => (
                  <div key={s.id} className="text-xs bg-blue-100 text-blue-800 rounded p-1 cursor-pointer hover:bg-blue-200 transition-colors"
                    onClick={() => { /* could open detail modal */ }}>
                    <p className="font-semibold truncate">{s.client.name}</p>
                    <p className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(s.scheduled_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
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
        <CardHeader><CardTitle className="text-base">Sesiones de la semana</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin sesiones esta semana</p>
            </div>
          ) : (
            sessions.map((s) => {
              const date = new Date(s.scheduled_at);
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{date.toLocaleDateString("es", { month: "short" }).toUpperCase()}</span>
                    <span className="text-sm font-bold text-primary">{date.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })} · {s.duration_minutes} min
                      {s.title && ` · ${s.title}`}
                    </p>
                  </div>
                  <Badge className={STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}>
                    {STATUS_LABELS[s.status] ?? s.status}
                  </Badge>
                  <div className="flex gap-1">
                    {s.status === "scheduled" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                        onClick={() => updateStatus(s.id, "completed")} title="Marcar completada">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => deleteSession(s.id)} title="Eliminar">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* New session dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nueva sesión</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>Cliente *</Label>
              <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder="Seleccioná un cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fecha y hora *</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required />
            </div>
            <div className="space-y-1">
              <Label>Duración (minutos)</Label>
              <Input type="number" min="15" max="240" step="15" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Título (opcional)</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Evaluación inicial" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || !form.client_id || !form.scheduled_at} className="flex-1">
                {saving ? "Creando..." : "Crear sesión"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
