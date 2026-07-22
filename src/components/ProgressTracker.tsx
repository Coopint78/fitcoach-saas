"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Plus, Camera, X } from "lucide-react";
import { toast } from "sonner";
import ProgressChart from "@/components/ProgressChart";

type Metric = {
  id: string;
  logged_at: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
  notes: string | null;
  photo_url: string | null;
};

type Props = { clientId: string };

export default function ProgressTracker({ clientId }: Props) {
  const { t } = useLanguage();
  const supabase = createClient();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ weight_kg: "", waist_cm: "", hips_cm: "", chest_cm: "", notes: "" });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase
      .from("body_metrics")
      .select("*")
      .eq("client_id", clientId)
      .order("logged_at", { ascending: true })
      .limit(90);
    setMetrics((data ?? []) as Metric[]);
  }

  useEffect(() => { load(); }, [clientId]);

  function handlePhotoChange(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    const hasData = form.weight_kg || form.waist_cm || form.hips_cm || form.chest_cm;
    if (!hasData && !photoFile) { toast.error(t("progress", "errorAtLeastOne")); return; }
    setSaving(true);

    let photoUrl: string | undefined;
    if (photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const res = await fetch("/api/progress/upload-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? t("progress", "errorUploadPhoto")); setSaving(false); return; }
      photoUrl = data.url;
    }

    const res = await fetch("/api/progress/body-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
        hips_cm: form.hips_cm ? Number(form.hips_cm) : null,
        chest_cm: form.chest_cm ? Number(form.chest_cm) : null,
        notes: form.notes || null,
        photo_url: photoUrl ?? null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { toast.error(data.error ?? t("progress", "errorSave")); return; }
    toast.success(t("progress", "successSave"));
    setOpen(false);
    setForm({ weight_kg: "", waist_cm: "", hips_cm: "", chest_cm: "", notes: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    load();
  }

  const photos = metrics.filter(m => m.photo_url);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-indigo-600" /> {t("progress", "title")}
        </h2>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> {t("progress", "register")}
        </Button>
      </div>

      {metrics.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("progress", "weight")}</CardTitle></CardHeader>
            <CardContent><ProgressChart metrics={metrics} metric="weight_kg" label={t("progress", "weight")} color="#6366f1" unit="kg" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("progress", "waist")}</CardTitle></CardHeader>
            <CardContent><ProgressChart metrics={metrics} metric="waist_cm" label={t("progress", "waist")} color="#f59e0b" unit="cm" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("progress", "hips")}</CardTitle></CardHeader>
            <CardContent><ProgressChart metrics={metrics} metric="hips_cm" label={t("progress", "hips")} color="#ec4899" unit="cm" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t("progress", "chest")}</CardTitle></CardHeader>
            <CardContent><ProgressChart metrics={metrics} metric="chest_cm" label={t("progress", "chest")} color="#10b981" unit="cm" /></CardContent>
          </Card>
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Camera className="h-4 w-4 text-indigo-600" /> {t("progress", "photos")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {photos.map(m => (
                <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={m.photo_url!} alt="Progreso" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
          <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("progress", "noRecords")}</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>{t("progress", "registerMeasures")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("progress", "weight")}</Label>
                <Input type="number" step="0.1" value={form.weight_kg} onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))} placeholder="70.5" className="rounded-xl h-10" />
              </div>
              <div className="space-y-1">
                <Label>{t("progress", "waist")}</Label>
                <Input type="number" step="0.1" value={form.waist_cm} onChange={e => setForm(p => ({ ...p, waist_cm: e.target.value }))} placeholder="80" className="rounded-xl h-10" />
              </div>
              <div className="space-y-1">
                <Label>{t("progress", "hips")}</Label>
                <Input type="number" step="0.1" value={form.hips_cm} onChange={e => setForm(p => ({ ...p, hips_cm: e.target.value }))} placeholder="95" className="rounded-xl h-10" />
              </div>
              <div className="space-y-1">
                <Label>{t("progress", "chest")}</Label>
                <Input type="number" step="0.1" value={form.chest_cm} onChange={e => setForm(p => ({ ...p, chest_cm: e.target.value }))} placeholder="90" className="rounded-xl h-10" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("progress", "notes")}</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={t("progress", "notesPlaceholder")} className="rounded-xl h-10" />
            </div>

            {/* Photo upload */}
            <div className="space-y-1">
              <Label>{t("progress", "photoLabel")}</Label>
              {photoPreview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{t("progress", "addPhoto")}</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl font-semibold">
              {saving ? t("progress", "saving") : t("progress", "save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
