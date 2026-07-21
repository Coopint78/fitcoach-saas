"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { ftInToCm, lbsToKg } from "@/lib/units";

export default function NuevoClientePage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [genderName, setGenderName] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", goal: "", notes: "",
    birthdate: "", gender: "",
    height_cm: "", height_ft: "", height_in: "",
    weight_kg: "", weight_lbs: "",
    address: "", phone: "",
  });

  function update(field: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "height_cm" && value) {
        const totalIn = Number(value) / 2.54;
        next.height_ft = String(Math.floor(totalIn / 12));
        next.height_in = String(Math.round(totalIn % 12));
      } else if (field === "height_ft" || field === "height_in") {
        const ft = Number(field === "height_ft" ? value : prev.height_ft) || 0;
        const inch = Number(field === "height_in" ? value : prev.height_in) || 0;
        next.height_cm = String(ftInToCm(ft, inch));
      } else if (field === "weight_kg" && value) {
        next.weight_lbs = String(Math.round(Number(value) * 2.20462));
      } else if (field === "weight_lbs" && value) {
        next.weight_kg = String(Math.round((lbsToKg(Number(value))) * 10) / 10);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) { toast.error("Error al obtener perfil"); setLoading(false); return; }

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        trainer_id: trainer.id,
        name: form.name,
        email: form.email,
        goal: form.goal || null,
        notes: form.notes || null,
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        address: form.address || null,
        phone: form.phone || null,
      })
      .select()
      .single();

    if (error) {
      toast.error(t("clients", "errorCreate") + ": " + error.message);
    } else {
      await sendInviteEmail(client.email, client.name, client.invite_token);
      toast.success(t("clients", "clientCreated"));
      router.push(`/dashboard/clientes/${client.id}`);
    }
    setLoading(false);
  }

  async function sendInviteEmail(email: string, name: string, token: string) {
    await fetch("/api/invitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, token }),
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("clients", "newClient")}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("clients", "clientData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{t("clients", "fullName")} *</Label>
                <Input value={form.name} onChange={e => update("name", e.target.value)} required placeholder="María López" />
              </div>
              <div className="space-y-1">
                <Label>{t("clients", "emailLabel")} *</Label>
                <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required placeholder="maria@email.com" />
              </div>
              <div className="space-y-1">
                <Label>{t("clients", "phone")}</Label>
                <Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+54 9 11 1234-5678" />
              </div>
              <div className="space-y-1">
                <Label>{t("clients", "birthdate")}</Label>
                <Input type="date" value={form.birthdate} onChange={e => update("birthdate", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>{t("clients", "gender")}</Label>
                <Select onValueChange={(v) => { const id = v ?? ""; update("gender", id); setGenderName(id === "M" ? t("clients", "genderMale") : id === "F" ? t("clients", "genderFemale") : id === "O" ? t("clients", "genderOther") : ""); }} value={form.gender}>
                  <SelectTrigger><SelectValue placeholder={t("clients", "genderSelect")}>{genderName || undefined}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">{t("clients", "genderMale")}</SelectItem>
                    <SelectItem value="F">{t("clients", "genderFemale")}</SelectItem>
                    <SelectItem value="O">{t("clients", "genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {lang === "es" ? (
                <div className="space-y-1">
                  <Label>{t("clients", "height")} ({t("clients", "heightUnit")})</Label>
                  <Input type="number" min="50" max="250" value={form.height_cm} onChange={e => update("height_cm", e.target.value)} placeholder={t("clients", "heightPlaceholder")} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>{t("clients", "height")} ({t("clients", "heightUnit")})</Label>
                  <div className="flex gap-2">
                    <Input type="number" min="1" max="8" value={form.height_ft} onChange={e => update("height_ft", e.target.value)} placeholder="5" className="w-20" />
                    <span className="self-center text-sm text-gray-500">{t("clients", "feet")}</span>
                    <Input type="number" min="0" max="11" value={form.height_in} onChange={e => update("height_in", e.target.value)} placeholder="10" className="w-20" />
                    <span className="self-center text-sm text-gray-500">{t("clients", "inches")}</span>
                  </div>
                </div>
              )}
              {lang === "es" ? (
                <div className="space-y-1">
                  <Label>{t("clients", "weight")} ({t("clients", "weightUnit")})</Label>
                  <Input type="number" min="20" max="300" step="0.1" value={form.weight_kg} onChange={e => update("weight_kg", e.target.value)} placeholder={t("clients", "weightPlaceholder")} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>{t("clients", "weight")} ({t("clients", "weightUnit")})</Label>
                  <Input type="number" min="44" max="660" value={form.weight_lbs} onChange={e => update("weight_lbs", e.target.value)} placeholder={t("clients", "weightPlaceholder")} />
                </div>
              )}
              <div className="space-y-1 sm:col-span-2">
                <Label>{t("clients", "address")}</Label>
                <Input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Av. Corrientes 1234, CABA" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("clients", "goal")}</Label>
              <Input value={form.goal} onChange={e => update("goal", e.target.value)} placeholder={t("clients", "goalPlaceholder")} />
            </div>
            <div className="space-y-1">
              <Label>{t("clients", "notes")}</Label>
              <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder={t("clients", "notesPlaceholder")} rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t("clients", "saving") : t("clients", "saveCreate")}
              </Button>
              <Link href="/dashboard/clientes">
                <Button type="button" variant="outline">{t("clients", "cancel")}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
