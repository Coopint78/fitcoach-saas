"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Video, Pencil, Layers } from "lucide-react";
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

  function openNew() { setEditTarget(null); setForm({ name: "", description: "", video_url: "" }); setOpen(true); }
  function openEdit(ex: Exercise) { setEditTarget(ex); setForm({ name: ex.name, description: ex.description ?? "", video_url: ex.video_url ?? "" }); setOpen(true); }

  async function handleSave() {
    if (!form.name.trim()) { toast.error(t("exercises", "nameRequired_err")); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;
    if (editTarget) {
      const { error } = await supabase.from("exercises").update({ name: form.name, description: form.description || null, video_url: form.video_url || null }).eq("id", editTarget.id);
      if (error) toast.error(t("exercises", "errorUpdate")); else { toast.success(t("exercises", "updated")); setOpen(false); load(); }
    } else {
      const { error } = await supabase.from("exercises").insert({ trainer_id: trainer.id, name: form.name, description: form.description || null, video_url: form.video_url || null });
      if (error) toast.error(t("exercises", "errorCreate")); else { toast.success(t("exercises", "created")); setOpen(false); load(); }
    }
    setLoading(false);
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
          <DialogContent className="rounded-2xl">
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
              <div className="space-y-1.5">
                <Label>{t("exercises", "videoLabel")}</Label>
                <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder={t("exercises", "videoPlaceholder")} className="rounded-xl h-11" />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full h-11 rounded-xl font-semibold">
                {loading ? t("exercises", "saving") : editTarget ? t("exercises", "updateBtn") : t("exercises", "createBtn")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
                    <Video className="h-3 w-3" /> {t("exercises", "watchVideo")}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
