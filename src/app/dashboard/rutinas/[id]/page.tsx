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
import { ArrowLeft, Plus, GripVertical, Trash2, ClipboardList, Search, BookOpen, Layers, Pencil, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Exercise, RoutineItem } from "@/types/database";
import { useLanguage } from "@/lib/i18n/context";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ExerciseSource = "mine" | "library";

function exName(ex: Exercise, lang: string) {
  if (lang === "en") return ex.name_en ?? ex.name;
  return ex.name_es ?? ex.name;
}

// ── Sortable row ─────────────────────────────────────────────────────────────
function SortableItem({
  item,
  idx,
  lang,
  t,
  onRemove,
  onSaveNotes,
}: {
  item: RoutineItem & { exercise: Exercise };
  idx: number;
  lang: string;
  t: (ns: string, key: string) => string;
  onRemove: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(item.coach_notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  async function saveNotes() {
    setSavingNotes(true);
    await onSaveNotes(item.id, notesValue);
    setSavingNotes(false);
    setEditingNotes(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 p-3.5 bg-muted/50 rounded-xl group"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none"
          type="button"
          aria-label="Reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{idx + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {item.exercise?.is_system ? exName(item.exercise, lang) : item.exercise?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.sets} {t("routines", "setsX")} {item.reps}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
            onClick={() => setEditingNotes(v => !v)}
            title="Notas para el cliente"
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-lg"
            onClick={() => onRemove(item.id)}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Coach notes display */}
      {!editingNotes && item.coach_notes && (
        <div className="ml-11 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 rounded-lg px-3 py-2">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">Notas para el cliente</p>
          <p className="text-xs text-indigo-700 dark:text-indigo-300">{item.coach_notes}</p>
        </div>
      )}

      {/* Coach notes editor */}
      {editingNotes && (
        <div className="ml-11 space-y-2">
          <Textarea
            value={notesValue}
            onChange={e => setNotesValue(e.target.value)}
            placeholder="Indicaciones, técnica, advertencias para el cliente..."
            className="text-xs rounded-xl resize-none min-h-[72px]"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 gap-1 rounded-lg text-xs" onClick={saveNotes} disabled={savingNotes}>
              <Check className="h-3 w-3" /> {savingNotes ? "Guardando..." : "Guardar"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-lg text-xs" onClick={() => { setEditingNotes(false); setNotesValue(item.coach_notes ?? ""); }}>
              <X className="h-3 w-3" /> Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RutinaEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [routineName, setRoutineName] = useState("");
  const [items, setItems] = useState<(RoutineItem & { exercise: Exercise })[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [library, setLibrary] = useState<Exercise[]>([]);

  const [open, setOpen] = useState(false);
  const [exSource, setExSource] = useState<ExerciseSource>("mine");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ exercise_id: "", sets: "3", reps: "10" });
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function load() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) { router.push("/login"); return; }
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;

    const [{ data: routine }, { data: its }, { data: exs }, { data: lib }] = await Promise.all([
      supabase.from("routines").select("name").eq("id", id).single(),
      supabase.from("routine_items").select("*, exercise:exercises(*)").eq("routine_id", id).order("order"),
      supabase.from("exercises").select("*").eq("trainer_id", trainer.id).order("name"),
      supabase.from("exercises").select("*").eq("is_system", true).order("name_es"),
    ]);
    setRoutineName(routine?.name ?? "");
    setItems((its ?? []) as (RoutineItem & { exercise: Exercise })[]);
    setExercises(exs ?? []);
    setLibrary(lib ?? []);
  }

  useEffect(() => { load(); }, [id]);

  const addedIds = new Set(items.map(i => i.exercise_id));
  const availableMine = exercises.filter(e => !addedIds.has(e.id));
  const filteredLibrary = library.filter(e => {
    if (addedIds.has(e.id)) return false;
    if (!search) return true;
    return exName(e, lang).toLowerCase().includes(search.toLowerCase());
  });

  function selectExercise(ex: Exercise) {
    setSelectedEx(ex);
    setForm(p => ({ ...p, exercise_id: ex.id }));
  }

  function resetDialog() {
    setForm({ exercise_id: "", sets: "3", reps: "10" });
    setSelectedEx(null);
    setSearch("");
    setExSource("mine");
  }

  async function addItem() {
    if (!form.exercise_id || !selectedEx) return;
    setLoading(true);
    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("routine_items")
      .insert({
        routine_id: id,
        exercise_id: form.exercise_id,
        sets: parseInt(form.sets) || 3,
        reps: form.reps || "10",
        order: items.length,
      })
      .select("id")
      .single();
    if (error) {
      toast.error(t("routines", "errorAdd"));
    } else {
      toast.success(t("routines", "exerciseAdded"));
      // Optimistic: append using the exercise already in state, avoiding RLS join issues
      setItems(prev => [
        ...prev,
        {
          id: inserted.id,
          routine_id: id,
          exercise_id: form.exercise_id,
          sets: parseInt(form.sets) || 3,
          reps: form.reps || "10",
          order: prev.length,
          coach_notes: null,
          exercise: selectedEx,
        },
      ]);
      setOpen(false);
      resetDialog();
    }
    setLoading(false);
  }

  async function removeItem(itemId: string) {
    setItems(prev => prev.filter(i => i.id !== itemId));
    const supabase = createClient();
    await supabase.from("routine_items").delete().eq("id", itemId);
  }

  async function saveNotes(itemId: string, notes: string) {
    const supabase = createClient();
    await supabase.from("routine_items").update({ coach_notes: notes || null }).eq("id", itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, coach_notes: notes || null } : i));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);

    // Optimistic update
    setItems(reordered);

    // Persist new order
    const supabase = createClient();
    await Promise.all(
      reordered.map((item, idx) =>
        supabase.from("routine_items").update({ order: idx }).eq("id", item.id)
      )
    );
  }

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
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog(); }}>
            <DialogTrigger>
              <Button size="sm" className="gap-1.5 h-8 rounded-xl font-semibold" type="button">
                <Plus className="h-3.5 w-3.5" /> {t("routines", "addBtn")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-xl overflow-hidden">
              <DialogHeader><DialogTitle>{t("routines", "addExerciseTitle")}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-1">

                {/* Source tabs */}
                <div className="flex gap-1 bg-muted/50 border border-border rounded-xl p-1">
                  <button
                    onClick={() => { setExSource("mine"); setSelectedEx(null); setForm(p => ({ ...p, exercise_id: "" })); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${exSource === "mine" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {t("exercises", "tabMine")}
                  </button>
                  <button
                    onClick={() => { setExSource("library"); setSelectedEx(null); setForm(p => ({ ...p, exercise_id: "" })); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${exSource === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {t("exercises", "tabLibrary")}
                  </button>
                </div>

                {/* Mine: dropdown */}
                {exSource === "mine" && (
                  <div className="space-y-1.5">
                    <Label>{t("routines", "exerciseLabel")}</Label>
                    {availableMine.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {exercises.length === 0 ? "No tenés ejercicios propios todavía." : "Todos tus ejercicios ya están en esta rutina."}
                      </p>
                    ) : (
                      <Select
                        value={form.exercise_id}
                        onValueChange={v => {
                          const ex = availableMine.find(e => e.id === v) ?? null;
                          setSelectedEx(ex);
                          setForm(p => ({ ...p, exercise_id: v ?? "" }));
                        }}
                      >
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder={t("routines", "selectExercise")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMine.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Library: search + list */}
                {exSource === "library" && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t("exercises", "searchPlaceholder")}
                        className="pl-9 rounded-xl h-10"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto overflow-x-hidden rounded-xl border border-border divide-y divide-border">
                      {filteredLibrary.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">{t("exercises", "noResults")}</p>
                      ) : (
                        filteredLibrary.map(ex => {
                          const name = exName(ex, lang);
                          const selected = selectedEx?.id === ex.id;
                          return (
                            <button
                              key={ex.id}
                              onClick={() => selectExercise(ex)}
                              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors ${selected ? "bg-primary/10" : ""}`}
                            >
                              {ex.image_url && (
                                <img src={ex.image_url} alt={name} className="h-9 w-9 rounded-lg object-cover shrink-0 bg-muted" />
                              )}
                              <div className="min-w-0">
                                <p className={`text-sm font-medium truncate ${selected ? "text-primary" : ""}`}>{name}</p>
                                {ex.primary_muscle && (
                                  <p className="text-xs text-muted-foreground">{ex.primary_muscle}</p>
                                )}
                              </div>
                              {selected && <span className="ml-auto text-primary text-xs font-semibold shrink-0">✓</span>}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Sets / reps */}
                {form.exercise_id && (
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
                )}

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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      idx={idx}
                      lang={lang}
                      t={t}
                      onRemove={removeItem}
                      onSaveNotes={saveNotes}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
