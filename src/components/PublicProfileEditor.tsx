"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Trainer = {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  location: string | null;
  instagram: string | null;
  website: string | null;
  profile_photo: string | null;
  public_profile: boolean | null;
};

export default function PublicProfileEditor({ trainer: initial }: { trainer: Trainer }) {
  const [form, setForm] = useState({
    bio: initial.bio ?? "",
    specialty: initial.specialty ?? "",
    location: initial.location ?? "",
    instagram: initial.instagram ?? "",
    website: initial.website ?? "",
    profile_photo: initial.profile_photo ?? "",
    public_profile: initial.public_profile ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/trainers/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) toast.success("Perfil actualizado");
    else toast.error(data.error ?? "Error al guardar");
  }

  function update(field: string, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
  }

  const profileUrl = `/entrenadores/${initial.id}`;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">Mi cuenta</p>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-indigo-600" /> Perfil público</h1>
        </div>
        {form.public_profile && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl"><ExternalLink className="h-4 w-4" /> Ver perfil</Button>
          </a>
        )}
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {form.public_profile ? <Eye className="h-5 w-5 text-green-500" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
            Visibilidad en el directorio
            <Badge className={form.public_profile ? "bg-green-100 text-green-700 ml-auto" : "bg-gray-100 text-gray-500 ml-auto"}>
              {form.public_profile ? "Visible" : "Oculto"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Al activarlo, tu perfil aparece en <Link href="/entrenadores" className="text-indigo-600 hover:underline">fit-coach.vip/entrenadores</Link> y cualquier persona puede encontrarte.
          </p>
          <Button
            variant={form.public_profile ? "destructive" : "default"}
            size="sm"
            className="rounded-xl"
            onClick={() => update("public_profile", !form.public_profile)}
          >
            {form.public_profile ? "Ocultar mi perfil" : "Publicar mi perfil"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Información del perfil</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Especialidad</Label>
            <Input value={form.specialty} onChange={e => update("specialty", e.target.value)} placeholder="Ej: Pérdida de peso, Musculación, Running" className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Ubicación</Label>
            <Input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Ciudad, País" className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Foto de perfil (URL)</Label>
            <Input value={form.profile_photo} onChange={e => update("profile_photo", e.target.value)} placeholder="https://…" className="rounded-xl h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Biografía</Label>
            <Textarea value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Contá tu experiencia, certificaciones y cómo trabajás con tus clientes…" rows={4} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={e => update("instagram", e.target.value)} placeholder="@tuusuario" className="rounded-xl h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Sitio web</Label>
              <Input value={form.website} onChange={e => update("website", e.target.value)} placeholder="tuweb.com" className="rounded-xl h-10" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl font-semibold">
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
