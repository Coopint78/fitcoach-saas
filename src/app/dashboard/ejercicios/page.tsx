"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Video, Pencil, Layers, Upload, X, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import type { Exercise } from "@/types/database";

export default function EjerciciosPage() {
  const { t } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>([]);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;
    const { data } = await supabase.from("exercises").select("*").eq("trainer_id", trainer.id).order("name");
    setExercises(data ?? []);
  }

  useEffect(() => { load(); }, []);

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
    const { data: { user } } = await supabase.auth.getUser();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("exercises", "library")}</p>
          <h1 className="text-2xl font-bold">{t("exercises", "title")}</h1>
        </div>
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
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Press de banca" className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("exercises", "descLabel")}</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t("exercises", "descPlaceholder")} rows={3} className="rounded-xl" />
              </div>

              {/* Video: URL o upload */}
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
      </div>

      {/* Preview modal */}
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
                    <button
                      onClick={() => setPreviewVideo(ex.video_url!)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                    >
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
    </div>
  );
}
