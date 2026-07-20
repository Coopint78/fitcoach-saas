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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const available = routines.filter((r) => !existingAssignments.includes(r.id));

  async function assign() {
    if (!selected) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("assignments").insert({ routine_id: selected, client_id: clientId });
    if (error) {
      toast.error("Error al asignar rutina");
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
        <Button size="sm" className="gap-1" type="button"><Plus className="h-3 w-3" /> Asignar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar rutina al cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select onValueChange={(v) => setSelected(v ?? "")} value={selected}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná una rutina" />
            </SelectTrigger>
            <SelectContent>
              {available.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={assign} disabled={!selected || loading} className="w-full">
            {loading ? "Asignando..." : "Asignar rutina"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
