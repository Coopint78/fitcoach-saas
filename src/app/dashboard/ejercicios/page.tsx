"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Video, Pencil, Layers, Upload, X, Play, BookOpen, Search, Dumbbell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import type { Exercise } from "@/types/database";
import type { Routine } from "@/types/database";

type Tab = "mine" | "library";

function unique(arr: (string | null | undefined)[]): string[] {
  return [...new Set(arr.filter((v): v is string => !!v))].sort();
}

function ExerciseName(ex: Exercise, lang: string): string {
  if (lang === "en") return ex.name_en ?? ex.name;
  return ex.name_es ?? ex.name;
}

function ExerciseDesc(ex: Exercise, lang: string): string | null {
  if (lang === "en") return ex.description_en ?? ex.description;
  return ex.description_es ?? ex.description;
}

// ── Library card ────────────────────────────────────────────────────────────
function LibraryCard({ ex, lang, t, routines, trainerId }: {
  ex: Exercise;
  lang: string;
  t: (ns: string, key: string) => string;
  routines: Routine[];
  trainerId: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [routineId, setRoutineId] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = ExerciseName(ex, lang);
  const desc = ExerciseDesc(ex, lang);

  async function addToRoutine() {
    if (!routineId) return;
    setSaving(true);
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("routine_items")
      .select("id")
      .eq("routine_id", routineId)
      .eq("exercise_id", ex.id)
      .maybeSingle();
    if (existing) {
      toast.error("Este ejercicio ya está en esa rutina");
      setSaving(false);
      return;
    }
    const { data: items } = await supabase
      .from("routine_items")
      .select("order")
      .eq("routine_id", routineId)
      .order("order", { ascending: false })
      .limit(1);
    const nextOrder = (items?.[0]?.order ?? -1) + 1;
    const { error } = await supabase.from("routine_items").insert({
      routine_id: routineId,
      exercise_id: ex.id,
      sets: parseInt(sets) || 3,
      reps: reps || "10",
      order: nextOrder,
    });
    setSaving(false);
    if (error) { toast.error(t("exercises", "errorAddRoutine")); return; }
    toast.success(t("exercises", "addedToRoutine"));
    setAddOpen(false);
    setRoutineId("");
    setSets("3");
    setReps("10");
  }

  return (
    <Card className="rounded-2xl border-border hover:border-primary/30 transition-all group overflow-hidden">
      {/* Images */}
      {ex.image_url && !imgError ? (
        <div className="relative h-36 bg-muted overflow-hidden flex">
          <img
            src={ex.image_url}
            alt={name}
            className="w-1/2 object-cover"
            onError={() => setImgError(true)}
          />
          {ex.image_url_end ? (
            <img
              src={ex.image_url_end}
              alt={name}
              className="w-1/2 object-cover border-l border-border"
            />
          ) : (
            <div className="w-1/2 bg-muted flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-20 bg-muted flex items-center justify-center">
          <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
        </div>
      )}

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug">{name}</h3>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0 rounded-lg text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <Plus className="h-3 w-3" /> {t("exercises", "addToRoutine")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-base">{t("exercises", "addToRoutine")}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground -mt-2">{name}</p>
              <div className="space-y-4 pt-1">
                {routines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("exercises", "noRoutines")}</p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label>{t("exercises", "selectRoutine")}</Label>
                      <Select value={routineId} onValueChange={v => setRoutineId(v ?? "")}>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder={t("exercises", "selectRoutine")} />
                        </SelectTrigger>
                        <SelectContent>
                          {routines.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Series</Label>
                        <Input type="number" min="1" value={sets} onChange={e => setSets(e.target.value)} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Reps</Label>
                        <Input value={reps} onChange={e => setReps(e.target.value)} placeholder="10, 12-15, 30s..." className="rounded-xl h-11" />
                      </div>
                    </div>
                    <Button
                      onClick={addToRoutine}
                      disabled={!routineId || saving}
                      className="w-full h-11 rounded-xl font-semibold"
                    >
                      {saving ? "Guardando..." : t("exercises", "addToRoutine")}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {ex.primary_muscle && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{ex.primary_muscle}</span>
          )}
          {ex.level && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{ex.level}</span>
          )}
          {ex.equipment && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{ex.equipment}</span>
          )}
        </div>

        {desc && <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function EjerciciosPage() {
  const { t, lang } = useLanguage();

  // Tab
  const [tab, setTab] = useState<Tab>("mine");

  // Trainer exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [trainerId, setTrainerId] = useState("");

  // Library
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // Routines (for "add to routine" dialog)
  const [routines, setRoutines] = useState<Routine[]>([]);

  // Create/edit dialog
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [form, setForm] = useState({ name: "", description: "", video_url: "" });
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;
    setTrainerId(trainer.id);

    const [{ data: exs }, { data: lib }, { data: ruts }] = await Promise.all([
      supabase.from("exercises").select("*").eq("trainer_id", trainer.id).order("name"),
      supabase.from("exercises").select("*").eq("is_system", true).order("name_es"),
      supabase.from("routines").select("id, name, trainer_id, created_at").eq("trainer_id", trainer.id).order("name"),
    ]);
    setExercises(exs ?? []);
    setLibrary(lib ?? []);
    setRoutines(ruts ?? []);
  }

  useEffect(() => { load(); }, []);

  // Library filter options
  const muscles = useMemo(() => unique(library.map(e => e.primary_muscle)), [library]);
  const categories = useMemo(() => unique(library.map(e => e.category)), [library]);
  const levels = useMemo(() => unique(library.map(e => e.level)), [library]);

  // Filtered library
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return library.filter(ex => {
      if (filterMuscle !== "all" && ex.primary_muscle !== filterMuscle) return false;
      if (filterCategory !== "all" && ex.category !== filterCategory) return false;
      if (filterLevel !== "all" && ex.level !== filterLevel) return false;
      if (q) {
        const name = ExerciseName(ex, lang).toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [library, search, filterMuscle, filterCategory, filterLevel, lang]);

  // ── Trainer exercise handlers ────────────────────────────────────────────
  function openNew() {
    setEditTarget(null);
    setForm({ name: "", description: "", video_url: "" });
    setVideoFile(null);
    setUploadMode("url");
    setOpen(true);
  }

  function openEdit(ex: Exercise) {
    setEditTarget(ex);
    setForm({ name: ex.name, description: ex.description ?? "", video_url: ex.video_url ?? "" });
    setVideoFile(null);
    setUploadMode("url");
    setOpen(true);
  }

  async function handleUploadVideo(): Promise<string | null> {
    if (!videoFile) return form.video_url;
    setUploading(true);
    setUploadProgress(10);
    const fd = new FormData();
    fd.append("file", videoFile);
    const res = await fetch("/api/exercises/upload-video", { method: "POST", body: fd });
    setUploadProgress(90);
    const data = await res.json();
    setUploading(false);
    setUploadProgress(0);
    if (!res.ok) { toast.error(data.error ?? "Error al subir video"); return null; }
    return data.url as string;
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error(t("exercises", "nameRequired_err")); return; }
    setLoading(true);
    const videoUrl = await handleUploadVideo();
    if (videoFile && videoUrl === null) { setLoading(false); return; }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;

    const payload = { name: form.name, description: form.description || null, video_url: videoUrl || null };

    if (editTarget) {
      const { error } = await supabase.from("exercises").update(payload).eq("id", editTarget.id);
      if (error) toast.error(t("exercises", "errorUpdate"));
      else { toast.success(t("exercises", "updated")); setOpen(false); load(); }
    } else {
      const { error } = await supabase.from("exercises").insert({ trainer_id: trainer.id, ...payload });
      if (error) toast.error(t("exercises", "errorCreate"));
      else { toast.success(t("exercises", "created")); setOpen(false); load(); }
    }
    setLoading(false);
  }

  function isStorageUrl(url: string) {
    return url.includes("supabase.co/storage");
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("exercises", "library")}</p>
          <h1 className="text-2xl font-bold">{t("exercises", "title")}</h1>
        </div>
        {tab === "mine" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button onClick={openNew} className="gap-2 h-10 rounded-xl font-semibold" type="button">
                <Plus className="h-4 w-4" /> {t("exercises", "newBtn")}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle>{editTarget ? t("exercises", "editTitle") : t("exercises", "newTitle")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>{t("exercises", "nameRequired")}</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t("exercises", "namePlaceholder")} className="rounded-xl h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("exercises", "descLabel")}</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t("exercises", "descPlaceholder")} rows={3} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>{t("exercises", "videoLabel")}</Label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant={uploadMode === "url" ? "default" : "outline"} onClick={() => setUploadMode("url")} className="rounded-lg text-xs">URL</Button>
                    <Button type="button" size="sm" variant={uploadMode === "file" ? "default" : "outline"} onClick={() => setUploadMode("file")} className="rounded-lg text-xs gap-1">
                      <Upload className="h-3 w-3" /> Subir archivo
                    </Button>
                  </div>
                  {uploadMode === "url" ? (
                    <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/..." className="rounded-xl h-11" />
                  ) : (
                    <div className="space-y-2">
                      <div
                        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileRef.current?.click()}
                      >
                        {videoFile ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium truncate">
                              <Video className="h-4 w-4 text-primary shrink-0" />
                              <span className="truncate">{videoFile.name}</span>
                            </div>
                            <button type="button" onClick={e => { e.stopPropagation(); setVideoFile(null); }} className="text-gray-400 hover:text-gray-600">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">MP4, WebM o MOV · máx. 100 MB</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/avi" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />
                      {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button onClick={handleSave} disabled={loading || uploading} className="w-full h-11 rounded-xl font-semibold">
                  {loading || uploading ? (uploading ? "Subiendo video…" : t("exercises", "saving")) : editTarget ? t("exercises", "updateBtn") : t("exercises", "createBtn")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("mine")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "mine" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Layers className="h-4 w-4" />
          {t("exercises", "tabMine")}
          {exercises.length > 0 && <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">{exercises.length}</span>}
        </button>
        <button
          onClick={() => setTab("library")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BookOpen className="h-4 w-4" />
          {t("exercises", "tabLibrary")}
          {library.length > 0 && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{library.length}</span>}
        </button>
      </div>

      {/* ── Tab: Mis ejercicios ── */}
      {tab === "mine" && (
        <>
          {previewVideo && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewVideo(null)}>
              <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <button className="absolute -top-10 right-0 text-white hover:text-gray-300" onClick={() => setPreviewVideo(null)}>
                  <X className="h-6 w-6" />
                </button>
                <video src={previewVideo} controls autoPlay className="w-full rounded-2xl" />
              </div>
            </div>
          )}

          {exercises.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Layers className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{t("exercises", "noExercises")}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t("exercises", "noExercisesDesc")}</p>
              <Button onClick={openNew} className="rounded-xl font-semibold gap-2"><Plus className="h-4 w-4" /> {t("exercises", "createFirst")}</Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {exercises.map((ex) => (
                <Card key={ex.id} className="rounded-2xl border-border hover:border-primary/30 transition-all group">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{ex.name}</h3>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ex)} className="h-7 w-7 p-0 shrink-0 opacity-0 group-hover:opacity-100 rounded-lg">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {ex.description && <p className="text-xs text-muted-foreground line-clamp-2">{ex.description}</p>}
                    {ex.video_url && (
                      isStorageUrl(ex.video_url) ? (
                        <button onClick={() => setPreviewVideo(ex.video_url!)} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                          <Play className="h-3 w-3" /> Ver video
                        </button>
                      ) : (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                          <Video className="h-3 w-3" /> {t("exercises", "watchVideo")}
                        </a>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Biblioteca ── */}
      {tab === "library" && (
        <div className="space-y-4">
          {/* Search + filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t("exercises", "searchPlaceholder")}
                className="pl-9 rounded-xl h-10"
              />
            </div>
            <Select value={filterMuscle} onValueChange={v => setFilterMuscle(v ?? "all")}>
              <SelectTrigger className="rounded-xl h-10 w-44">
                <SelectValue placeholder={t("exercises", "filterMuscle")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("exercises", "allMuscles")}</SelectItem>
                {muscles.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={v => setFilterCategory(v ?? "all")}>
              <SelectTrigger className="rounded-xl h-10 w-44">
                <SelectValue placeholder={t("exercises", "filterCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("exercises", "allCategories")}</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={v => setFilterLevel(v ?? "all")}>
              <SelectTrigger className="rounded-xl h-10 w-36">
                <SelectValue placeholder={t("exercises", "filterLevel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("exercises", "allLevels")}</SelectItem>
                {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            {filtered.length} ejercicio{filtered.length !== 1 ? "s" : ""}
            {(search || filterMuscle !== "all" || filterCategory !== "all" || filterLevel !== "all") && " encontrados"}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">{t("exercises", "noResults")}</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(ex => (
                <LibraryCard
                  key={ex.id}
                  ex={ex}
                  lang={lang}
                  t={t}
                  routines={routines}
                  trainerId={trainerId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
