"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, GripVertical, Trash2, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Exercise, RoutineItem } from "@/types/database";
import { useLanguage } from "@/lib/i18n/context";

export default function RutinaEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const [routineName, setRoutineName] = useState("");
  const [items, setItems] = useState<(RoutineItem & { exercise: Exercise })[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ exercise_id: "", sets: "3", reps: "10" });
  const [loading, setLoading] = useState(false);
  const [exerciseName, setExerciseName] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
    if (!user) { router.push("/login"); return; }
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;
    const [{ data: routine }, { data: its }, { data: exs }] = await Promise.all([
      supabase.from("routines").select("name").eq("id", id).single(),
      supabase.from("routine_items").select("*, exercise:exercises(*)").eq("routine_id", id).order("order"),
      supabase.from("exercises").select("*").eq("trainer_id", trainer.id).order("name"),
    ]);
    setRoutineName(routine?.name ?? "");
    setItems((its ?? []) as (RoutineItem & { exercise: Exercise })[]);
    setExercises(exs ?? []);
  }

  useEffect(() => { load(); }, [id]);

  async function addItem() {
    if (!form.exercise_id) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("routine_items").insert({
      routine_id: id, exercise_id: form.exercise_id,
      sets: parseInt(form.sets) || 3, reps: form.reps || "10", order: items.length,
    });
    if (error) toast.error(t("routines", "errorAdd"));
    else {
      toast.success(t("routines", "exerciseAdded"));
      setOpen(false);
      setForm({ exercise_id: "", sets: "3", reps: "10" });
      setExerciseName("");
      load();
    }
    setLoading(false);
  }

  async function removeItem(itemId: string) {
    const supabase = createClient();
    await supabase.from("routine_items").delete().eq("id", itemId);
    load();
  }

  const availableExercises = exercises.filter(e => !items.find(i => i.exercise_id === e.id));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/rutinas">
          <Button variant="ghost" size="sm" className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">{t("routines", "routineLabel")}</p>
          <h1 className="text-2xl font-bold">{routineName || t("routines", "loading")}</h1>
        </div>
      </div>

      <Card className="rounded-2xl border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            {t("routines", "exerciseCount").replace("{n}", String(items.length))}
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button size="sm" className="gap-1.5 h-8 rounded-xl font-semibold" disabled={availableExercises.length === 0} type="button">
                <Plus className="h-3.5 w-3.5" /> {t("routines", "addBtn")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>{t("routines", "addExerciseTitle")}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>{t("routines", "exerciseLabel")}</Label>
                  <Select value={form.exercise_id} onValueChange={v => { const eid = v ?? ""; setForm(p => ({ ...p, exercise_id: eid })); setExerciseName(availableExercises.find(e => e.id === eid)?.name ?? ""); }}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder={t("routines", "selectExercise")}>{exerciseName || undefined}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("routines", "setsLabel")}</Label>
                    <Input type="number" min="1" value={form.sets} onChange={e => setForm(p => ({ ...p, sets: e.target.value }))} className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("routines", "repsLabel")}</Label>
                    <Input value={form.reps} onChange={e => setForm(p => ({ ...p, reps: e.target.value }))} placeholder="10, 12-15, 30s..." className="rounded-xl h-11" />
                  </div>
                </div>
                <Button onClick={addItem} disabled={!form.exercise_id || loading} className="w-full h-11 rounded-xl font-semibold">
                  {loading ? t("routines", "adding") : t("routines", "addExerciseBtn")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">{t("routines", "emptyRoutine")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-xl group">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.exercise?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sets} {t("routines", "setsX")} {item.reps}</p>
                  </div>
                  <Button variant="ghost" size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
