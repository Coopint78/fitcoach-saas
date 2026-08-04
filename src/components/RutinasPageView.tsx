"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, ClipboardList, ChevronRight, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

type Routine = {
  id: string;
  name: string;
  is_template?: boolean;
  routine_items: { count: number }[];
};

export default function RutinasPageView({ routines: initialRoutines }: { routines: Routine[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [routines, setRoutines] = useState(initialRoutines);
  const [duplicateTarget, setDuplicateTarget] = useState<Routine | null>(null);
  const [newName, setNewName] = useState("");
  const [duplicating, setDuplicating] = useState(false);
  // deleteStep: 0 = idle, 1 = confirm pending, 2 = deleting
  const [deleteStep, setDeleteStep] = useState<Record<string, number>>({});

  async function handleDelete(r: Routine) {
    setDeleteStep(p => ({ ...p, [r.id]: 2 }));
    const res = await fetch(`/api/routines/${r.id}`, { method: "DELETE" });
    if (res.ok) {
      setRoutines(prev => prev.filter(x => x.id !== r.id));
      toast.success(t("routines", "routineDeleted").replace("{name}", r.name));
    } else {
      const data = await res.json();
      if (data.error === "assigned") {
        toast.error(t("routines", "assignedError"));
      } else {
        toast.error(t("routines", "errorDelete"));
      }
      setDeleteStep(p => ({ ...p, [r.id]: 0 }));
    }
  }

  async function handleDuplicate() {
    if (!duplicateTarget) return;
    setDuplicating(true);
    const res = await fetch("/api/routines/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routine_id: duplicateTarget.id, new_name: newName || undefined }),
    });
    const data = await res.json();
    setDuplicating(false);
    if (!res.ok) { toast.error(data.error ?? t("routines", "errorDuplicate")); return; }
    toast.success(`Rutina "${data.name}" creada`);
    setDuplicateTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("routines", "library")}</p>
          <h1 className="text-2xl font-bold">{t("routines", "title")}</h1>
        </div>
        <Link href="/dashboard/rutinas/nueva">
          <Button className="gap-2 h-10 rounded-xl font-semibold"><Plus className="h-4 w-4" /> {t("routines", "newRoutine")}</Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">{t("routines", "noRoutines")}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t("routines", "noRoutinesDesc")}</p>
          <Link href="/dashboard/rutinas/nueva">
            <Button className="rounded-xl font-semibold gap-2"><Plus className="h-4 w-4" /> {t("routines", "createFirst")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((r) => {
            const exCount = r.routine_items?.[0]?.count ?? 0;
            return (
              <Card key={r.id} className="rounded-2xl border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all group">
                <CardContent className="p-5 flex items-center gap-4">
                  <Link href={`/dashboard/rutinas/${r.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{r.name}</p>
                        {r.is_template && <Badge variant="secondary" className="text-xs shrink-0">{t("routines", "templateBadge")}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{exCount} {t("routines", "exercises")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg"
                      title={t("routines", "duplicateBtnTitle")}
                      onClick={e => { e.preventDefault(); setDuplicateTarget(r); setNewName(`${r.name} ${t("routines", "copyNameSuffix")}`); }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {deleteStep[r.id] === 1 ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs rounded-lg"
                          disabled={deleteStep[r.id] === 2}
                          onClick={e => { e.preventDefault(); handleDelete(r); }}
                        >
                          {t("routines", "yesDelete")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs rounded-lg"
                          onClick={e => { e.preventDefault(); setDeleteStep(p => ({ ...p, [r.id]: 0 })); }}
                        >
                          {t("routines", "noCancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar rutina"
                        onClick={e => { e.preventDefault(); setDeleteStep(p => ({ ...p, [r.id]: 1 })); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Duplicate dialog */}
      <Dialog open={!!duplicateTarget} onOpenChange={v => { if (!v) setDuplicateTarget(null); }}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("routines", "duplicateTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>{t("routines", "copyNameLabel")}</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} className="rounded-xl h-11" autoFocus />
            </div>
            <Button onClick={handleDuplicate} disabled={duplicating} className="w-full h-11 rounded-xl font-semibold">
              {duplicating ? t("routines", "duplicating") : t("routines", "createCopy")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
