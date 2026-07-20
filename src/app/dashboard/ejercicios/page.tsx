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
import type { Exercise } from "@/types/database";

export default function EjerciciosPage() {
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

  function openNew() {
    setEditTarget(null);
    setForm({ name: "", description: "", video_url: "" });
    setOpen(true);
  }

  function openEdit(ex: Exercise) {
    setEditTarget(ex);
    setForm({ name: ex.name, description: ex.description ?? "", video_url: ex.video_url ?? "" });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) return;

    if (editTarget) {
      const { error } = await supabase.from("exercises").update({ name: form.name, description: form.description || null, video_url: form.video_url || null }).eq("id", editTarget.id);
      if (error) toast.error("Error al actualizar"); else { toast.success("Ejercicio actualizado"); setOpen(false); load(); }
    } else {
      const { error } = await supabase.from("exercises").insert({ trainer_id: trainer.id, name: form.name, description: form.description || null, video_url: form.video_url || null });
      if (error) toast.error("Error al crear"); else { toast.success("Ejercicio creado"); setOpen(false); load(); }
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ejercicios</h1>
          <p className="text-sm text-gray-600">{exercises.length} ejercicio{exercises.length !== 1 ? "s" : ""} en tu biblioteca</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button onClick={openNew} className="gap-2" type="button"><Plus className="h-4 w-4" /> Nuevo ejercicio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTarget ? "Editar ejercicio" : "Nuevo ejercicio"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Press de banca" />
              </div>
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Cómo ejecutar el ejercicio..." rows={3} />
              </div>
              <div className="space-y-1">
                <Label>URL de video (YouTube, etc.)</Label>
                <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Guardando..." : editTarget ? "Actualizar" : "Crear ejercicio"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">Sin ejercicios todavía</h3>
          <p className="text-sm text-gray-500 mb-6">Creá ejercicios para poder armar rutinas</p>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Crear primer ejercicio</Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((ex) => (
            <Card key={ex.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{ex.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(ex)} className="h-7 w-7 p-0 flex-shrink-0">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
                {ex.description && <p className="text-xs text-gray-600 line-clamp-2">{ex.description}</p>}
                {ex.video_url && (
                  <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <Video className="h-3 w-3" /> Ver video
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
