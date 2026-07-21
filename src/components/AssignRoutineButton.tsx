"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AssignRoutineButton({
  clientId,
  routines,
  existingAssignments,
}: {
  clientId: string;
  routines: { id: string; name: string }[];
  existingAssignments: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const available = routines.filter((r) => !existingAssignments.includes(r.id));

  async function assign() {
    if (!selected) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("assignments").insert({ routine_id: selected, client_id: clientId });
    if (error) {
      toast.error(`Error al asignar rutina: ${error.message}`);
    } else {
      toast.success("Rutina asignada");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (available.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="gap-1.5 h-8 rounded-xl font-semibold" type="button">
          <Plus className="h-3.5 w-3.5" /> Asignar
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Asignar rutina al cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select onValueChange={(v) => { const id = v ?? ""; setSelected(id); setSelectedName(available.find(r => r.id === id)?.name ?? ""); }} value={selected}>
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Seleccioná una rutina">{selectedName || undefined}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {available.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={assign} disabled={!selected || loading} className="w-full h-11 rounded-xl font-semibold">
            {loading ? "Asignando..." : "Asignar rutina"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
