"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X, Clock } from "lucide-react";

const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type Slot = { day_of_week: number; start_time: string; end_time: string };

export default function AvailabilityEditor() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/availability").then(r => r.json()).then(data => {
      setSlots(data.slots ?? []);
      setDuration(data.session_duration_minutes ?? 60);
      setLoading(false);
    });
  }, []);

  function addSlot(day: number) {
    setSlots(s => [...s, { day_of_week: day, start_time: "09:00", end_time: "10:00" }]);
  }

  function removeSlot(idx: number) {
    setSlots(s => s.filter((_, i) => i !== idx));
  }

  function updateSlot(idx: number, field: "start_time" | "end_time", value: string) {
    setSlots(s => s.map((slot, i) => i === idx ? { ...slot, [field]: value } : slot));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slots, session_duration_minutes: duration }),
    });
    if (res.ok) toast.success("Disponibilidad guardada");
    else toast.error("Error al guardar");
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disponibilidad</h1>
        <p className="text-muted-foreground text-sm">Configurá tus horarios disponibles y la duración estándar de tus sesiones</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Duración estándar de sesiones</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-xs">
            <Input type="number" min="15" max="240" step="15" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-28" />
            <Label className="text-sm text-muted-foreground">minutos por sesión</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Este valor se pre-completará al crear nuevas sesiones.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Horarios disponibles</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {DAY_LABELS.map((label, day) => {
            const daySlots = slots.map((s, i) => ({ ...s, idx: i })).filter(s => s.day_of_week === day);
            return (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{label}</p>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => addSlot(day)}>
                    <Plus className="h-3 w-3" /> Agregar horario
                  </Button>
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-1">Sin disponibilidad</p>
                ) : (
                  daySlots.map(s => (
                    <div key={s.idx} className="flex items-center gap-2 pl-1">
                      <Input type="time" value={s.start_time} onChange={e => updateSlot(s.idx, "start_time", e.target.value)} className="w-32 text-sm" />
                      <span className="text-muted-foreground text-sm">—</span>
                      <Input type="time" value={s.end_time} onChange={e => updateSlot(s.idx, "end_time", e.target.value)} className="w-32 text-sm" />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => removeSlot(s.idx)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Guardando..." : "Guardar disponibilidad"}
      </Button>
    </div>
  );
}
