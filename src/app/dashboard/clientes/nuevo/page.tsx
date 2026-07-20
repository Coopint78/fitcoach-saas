"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", goal: "", notes: "" });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
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
      .insert({ trainer_id: trainer.id, name: form.name, email: form.email, goal: form.goal || null, notes: form.notes || null })
      .select()
      .single();

    if (error) {
      toast.error("Error al crear cliente: " + error.message);
    } else {
      await sendInviteEmail(client.email, client.name, client.invite_token);
      toast.success("Cliente creado. Se envió la invitación por email.");
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
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo cliente</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre completo *</Label>
              <Input value={form.name} onChange={e => update("name", e.target.value)} required placeholder="María López" />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required placeholder="maria@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Objetivo</Label>
              <Input value={form.goal} onChange={e => update("goal", e.target.value)} placeholder="Ej: Bajar 10kg, ganar masa muscular..." />
            </div>
            <div className="space-y-1">
              <Label>Notas internas</Label>
              <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Lesiones, limitaciones, historial..." rows={3} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Guardando..." : "Crear y enviar invitación"}
              </Button>
              <Link href="/dashboard/clientes">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
