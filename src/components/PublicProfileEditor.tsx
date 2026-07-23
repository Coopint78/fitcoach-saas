"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Eye, EyeOff, ExternalLink, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Trainer = {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  location: string | null;
  instagram: string | null;
  profile_photo: string | null;
  public_profile: boolean | null;
};

// Resize image client-side to a square crop (400×400) before upload
function resizeImage(file: File, size = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      // Center-crop
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.88);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function PublicProfileEditor({ trainer: initial }: { trainer: Trainer }) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bio: initial.bio ?? "",
    specialty: initial.specialty ?? "",
    location: initial.location ?? "",
    instagram: initial.instagram ?? "",
    profile_photo: initial.profile_photo ?? "",
    public_profile: initial.public_profile ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(initial.profile_photo ?? "");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const resized = new File([blob], "photo.jpg", { type: "image/jpeg" });
      // Show preview immediately
      setPreview(URL.createObjectURL(blob));
      const fd = new FormData();
      fd.append("file", resized);
      const res = await fetch("/api/trainers/upload-photo", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        setForm(p => ({ ...p, profile_photo: data.url }));
        setPreview(data.url);
        toast.success(t("publicProfile", "photoUploaded"));
      } else {
        toast.error(data.error ?? t("publicProfile", "errorSave"));
      }
    } catch {
      toast.error(t("publicProfile", "errorSave"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/trainers/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) toast.success(t("publicProfile", "successSave"));
    else toast.error(data.error ?? t("publicProfile", "errorSave"));
  }

  function update(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
  }

  const profileUrl = `/entrenadores/${initial.id}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("publicProfile", "accountLabel")}</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-indigo-600" /> {t("publicProfile", "title")}</h1>
        </div>
        {form.public_profile && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl"><ExternalLink className="h-4 w-4" /> {t("publicProfile", "viewProfile")}</Button>
          </a>
        )}
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {form.public_profile ? <Eye className="h-5 w-5 text-green-500" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
            {t("publicProfile", "visibilityTitle")}
            <Badge className={form.public_profile ? "bg-green-100 text-green-700 ml-auto" : "bg-gray-100 text-gray-500 ml-auto"}>
              {form.public_profile ? t("publicProfile", "visible") : t("publicProfile", "hidden")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            {t("publicProfile", "visibilityDesc")} <Link href="/entrenadores" className="text-indigo-600 hover:underline">fit-coach.vip/entrenadores</Link>.
          </p>
          <Button
            size="sm"
            className={`rounded-xl font-semibold ${form.public_profile ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
            onClick={() => update("public_profile", !form.public_profile)}
          >
            {form.public_profile ? t("publicProfile", "hide") : t("publicProfile", "publish")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">{t("publicProfile", "infoTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">

          {/* Profile photo upload */}
          <div className="space-y-2">
            <Label>{t("publicProfile", "photo")}</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {preview ? (
                  <img src={preview} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">{t("publicProfile", "photoHint")}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t("publicProfile", "uploading")}</> : <><Upload className="h-4 w-4" /> {t("publicProfile", "uploadPhoto")}</>}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("publicProfile", "specialty")}</Label>
            <Input value={form.specialty} onChange={e => update("specialty", e.target.value)} placeholder={t("publicProfile", "specialtyPlaceholder")} className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("publicProfile", "location")}</Label>
            <Input value={form.location} onChange={e => update("location", e.target.value)} placeholder={t("publicProfile", "locationPlaceholder")} className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("publicProfile", "bio")}</Label>
            <Textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder={t("publicProfile", "bioPlaceholder")} rows={4} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>{t("publicProfile", "instagram")}</Label>
            <Input value={form.instagram} onChange={e => update("instagram", e.target.value)} placeholder={t("publicProfile", "instagramPlaceholder")} className="rounded-xl h-10" />
          </div>

          <Button onClick={handleSave} disabled={saving || uploading} className="w-full h-11 rounded-xl font-semibold">
            {saving ? t("publicProfile", "saving") : t("publicProfile", "saveChanges")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
