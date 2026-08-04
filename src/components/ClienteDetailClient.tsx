"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Target, FileText, ClipboardList, Phone, MapPin, Ruler, Weight, Calendar, Pencil, X, Check, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import AssignRoutineButton from "@/components/AssignRoutineButton";
import CopyLinkButton from "@/components/CopyLinkButton";
import ChatWindow from "@/components/ChatWindow";
import ProgressTracker from "@/components/ProgressTracker";
import ProgressPhotos from "@/components/ProgressPhotos";
import { createClient as createSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, displayHeight, displayWeight } from "@/lib/units";

type Client = {
  id: string; name: string; email: string; user_id?: string | null;
  goal?: string | null; notes?: string | null; phone?: string | null;
  birthdate?: string | null; gender?: string | null;
  height_cm?: number | null; weight_kg?: number | null; address?: string | null;
  invite_token?: string | null;
};
type Routine = { id: string; name: string };
type RoutineExercise = {
  id: string; exercise_id: string; sets: number; reps: string; order: number;
  coach_notes: string | null;
  exercise: { id: string; name: string; name_es?: string | null; name_en?: string | null; is_system?: boolean };
};
type Assignment = {
  id: string; routine_id: string;
  routine: { id: string; name: string } | null;
  items?: RoutineExercise[];
};

function calcAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function genderLabel(g: string, t: (s: string, k: string) => string): string {
  if (g === "M") return t("clients", "genderMale");
  if (g === "F") return t("clients", "genderFemale");
  if (g === "O") return t("clients", "genderOther");
  return g;
}

function initFormFromClient(client: Client, lang: string) {
  const heightFtIn = client.height_cm ? cmToFtIn(client.height_cm) : null;
  return {
    name: client.name,
    email: client.email,
    goal: client.goal ?? "",
    notes: client.notes ?? "",
    phone: client.phone ?? "",
    birthdate: client.birthdate ?? "",
    gender: client.gender ?? "",
    // metric (always stored)
    height_cm: client.height_cm?.toString() ?? "",
    weight_kg: client.weight_kg?.toString() ?? "",
    // imperial display fields
    height_ft: heightFtIn ? String(heightFtIn.ft) : "",
    height_in: heightFtIn ? String(heightFtIn.inch) : "",
    weight_lbs: client.weight_kg ? String(kgToLbs(client.weight_kg)) : "",
    address: client.address ?? "",
  };
}

export default function ClienteDetailClient({
  client: initialClient,
  trainerId,
  routines,
  assignments,
  inviteLink,
}: {
  client: Client;
  trainerId: string;
  routines: Routine[];
  assignments: Assignment[];
  inviteLink: string;
}) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState(initialClient);
  const [genderName, setGenderName] = useState(client.gender ? genderLabel(client.gender, t) : "");
  const [form, setForm] = useState(() => initFormFromClient(initialClient, lang));

  function update(field: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // keep metric and imperial in sync as user types
      if (field === "height_cm" && value) {
        const ftIn = cmToFtIn(Number(value));
        next.height_ft = String(ftIn.ft);
        next.height_in = String(ftIn.inch);
      } else if ((field === "height_ft" || field === "height_in")) {
        const ft = Number(field === "height_ft" ? value : prev.height_ft) || 0;
        const inch = Number(field === "height_in" ? value : prev.height_in) || 0;
        next.height_cm = String(ftInToCm(ft, inch));
      } else if (field === "weight_kg" && value) {
        next.weight_lbs = String(kgToLbs(Number(value)));
      } else if (field === "weight_lbs" && value) {
        next.weight_kg = String(lbsToKg(Number(value)));
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createSupabase();
    const { data, error } = await supabase
      .from("clients")
      .update({
        name: form.name,
        email: form.email,
        goal: form.goal || null,
        notes: form.notes || null,
        phone: form.phone || null,
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        address: form.address || null,
      })
      .eq("id", client.id)
      .select()
      .single();

    if (error) {
      toast.error(t("clients", "errorUpdate") + ": " + error.message);
    } else {
      setClient(data);
      setEditing(false);
      toast.success(t("clients", "clientUpdated"));
      router.refresh();
    }
    setSaving(false);
  }

  function handleCancel() {
    setForm(initFormFromClient(client, lang));
    setGenderName(client.gender ? genderLabel(client.gender, t) : "");
    setEditing(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{client.name}</h1>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
        <Badge className="flex-shrink-0" variant={client.user_id ? "default" : "secondary"}>
          {client.user_id ? t("clients", "activeAccount") : t("clients", "noAccount")}
        </Badge>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="flex-shrink-0 gap-1">
            <Pencil className="h-3 w-3" />{t("clients", "editClient")}
          </Button>
        ) : (
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
              <Check className="h-3 w-3" />{saving ? t("clients", "saving") : t("clients", "saveUpdate")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
              <X className="h-3 w-3" />{t("clients", "cancel")}
            </Button>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t("clients", "information")}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>{t("clients", "fullName")} *</Label>
                  <Input value={form.name} onChange={e => update("name", e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>{t("clients", "emailLabel")} *</Label>
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required />
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
                  <Select onValueChange={(v) => { const id = v ?? ""; update("gender", id); setGenderName(genderLabel(id, t)); }} value={form.gender}>
                    <SelectTrigger><SelectValue placeholder={t("clients", "genderSelect")}>{genderName || undefined}</SelectValue></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">{t("clients", "genderMale")}</SelectItem>
                      <SelectItem value="F">{t("clients", "genderFemale")}</SelectItem>
                      <SelectItem value="O">{t("clients", "genderOther")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Height — metric or imperial */}
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

                {/* Weight — metric or imperial */}
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
                  <Input value={form.address} onChange={e => update("address", e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>{t("clients", "goal")}</Label>
                  <Input value={form.goal} onChange={e => update("goal", e.target.value)} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>{t("clients", "notes")}</Label>
                  <Textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3} />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow icon={<Mail className="h-4 w-4 text-gray-400" />} label={t("clients", "emailLabel")} value={client.email} />
                {client.phone && <InfoRow icon={<Phone className="h-4 w-4 text-gray-400" />} label={t("clients", "phone")} value={client.phone} />}
                {client.birthdate && (
                  <InfoRow
                    icon={<Calendar className="h-4 w-4 text-gray-400" />}
                    label={t("clients", "birthdate")}
                    value={`${formatDate(client.birthdate)} (${calcAge(client.birthdate)} ${t("clients", "age")})`}
                  />
                )}
                {client.gender && <InfoRow icon={<span className="text-gray-400 text-xs font-bold">♀♂</span>} label={t("clients", "gender")} value={genderLabel(client.gender, t)} />}
                {client.height_cm && (
                  <InfoRow
                    icon={<Ruler className="h-4 w-4 text-gray-400" />}
                    label={`${t("clients", "height")} (${t("clients", "heightUnit")})`}
                    value={displayHeight(client.height_cm, lang)}
                  />
                )}
                {client.weight_kg && (
                  <InfoRow
                    icon={<Weight className="h-4 w-4 text-gray-400" />}
                    label={`${t("clients", "weight")} (${t("clients", "weightUnit")})`}
                    value={displayWeight(client.weight_kg, lang)}
                  />
                )}
                {client.address && <InfoRow icon={<MapPin className="h-4 w-4 text-gray-400" />} label={t("clients", "address")} value={client.address} className="sm:col-span-2" />}
                {client.goal && <InfoRow icon={<Target className="h-4 w-4 text-indigo-500" />} label={t("clients", "goal")} value={client.goal} className="sm:col-span-2" />}
                {client.notes && <InfoRow icon={<FileText className="h-4 w-4 text-gray-400" />} label={t("clients", "notes")} value={client.notes} className="sm:col-span-2" />}
              </div>
            )}
          </CardContent>
        </Card>

        {!client.user_id && (
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{t("clients", "invitation")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-600">{t("clients", "invitationDesc")}</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <code className="text-xs text-gray-700 flex-1 break-all">{inviteLink}</code>
              </div>
              <CopyLinkButton link={inviteLink} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-indigo-600">📈</span> Progreso de {client.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressTracker clientId={client.id} />
        </CardContent>
      </Card>

      {/* Progress Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span>📸</span> {t("clients", "progressPhotos") || "Fotos de progreso"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressPhotos clientId={client.id} clientName={client.name} />
        </CardContent>
      </Card>

      {/* Chat */}
      {client.user_id && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-indigo-600">💬</span> Chat con {client.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-2xl">
            <ChatWindow trainerId={trainerId} clientId={client.id} myRole="trainer" clientName={client.name} />
          </CardContent>
        </Card>
      )}

      {/* Routines with per-client coach notes */}
      <RoutinesSection client={client} routines={routines} assignments={assignments} lang={lang} t={t} />
    </div>
  );
}

function exDisplayName(ex: RoutineExercise["exercise"], lang: string): string {
  if (lang === "en") return ex.name_en ?? ex.name;
  return ex.name_es ?? ex.name;
}

function RoutineNoteEditor({
  item, clientId,
}: {
  item: RoutineExercise; clientId: string;
}) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.coach_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/clients/${clientId}/exercise-notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routine_item_id: item.id, notes: value }),
    });
    if (res.ok) {
      setEditing(false);
      item.coach_notes = value || null;
    } else {
      toast.error(t("clients", "errorSaveNote"));
    }
    setSaving(false);
  }

  return (
    <div className="space-y-1.5">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
            item.coach_notes
              ? "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
              : "bg-gray-50 border-dashed border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{item.coach_notes || t("clients", "addNoteForClient")}</span>
          <Pencil className="h-3 w-3 ml-auto shrink-0 mt-0.5 opacity-50" />
        </button>
      ) : (
        <div className="space-y-1.5">
          <Textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={t("clients", "notePlaceholder")}
            className="text-xs rounded-xl resize-none min-h-[64px]"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 gap-1 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-700" onClick={save} disabled={saving}>
              <Check className="h-3 w-3" /> {saving ? t("clients", "saving") : t("clients", "saveNote")}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 rounded-lg text-xs" onClick={() => { setEditing(false); setValue(item.coach_notes ?? ""); }}>
              <X className="h-3 w-3" /> {t("clients", "cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RoutinesSection({
  client, routines, assignments: initialAssignments, lang, t,
}: {
  client: Client;
  routines: Routine[];
  assignments: Assignment[];
  lang: string;
  t: (s: string, k: string) => string;
}) {
  const router = useRouter();
  const [assignments, setAssignments] = useState(initialAssignments);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [unassignDialog, setUnassignDialog] = useState<{ assignmentId: string; routineName: string } | null>(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  function toggle(id: string) {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  }

  async function handleConfirmUnassign() {
    if (!unassignDialog) return;
    setIsUnassigning(true);
    const res = await fetch(`/api/assignments/${unassignDialog.assignmentId}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments(prev => prev.filter(a => a.id !== unassignDialog.assignmentId));
      toast.success(t("clients", "routineUnassigned").replace("{name}", unassignDialog.routineName));
      setUnassignDialog(null);
      router.refresh();
    } else {
      toast.error(t("clients", "errorUnassign"));
      setIsUnassigning(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
          {t("clients", "assignedRoutines")}
        </CardTitle>
        <AssignRoutineButton clientId={client.id} routines={routines} existingAssignments={assignments.map(a => a.routine_id)} />
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">{t("clients", "noRoutines")}</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const isOpen = !!expanded[a.id];
              const items = (a.items ?? []).sort((x, y) => x.order - y.order);
              const step = unassignStep[a.id] ?? 0;
              return (
                <div key={a.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Routine header row */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
                    <button
                      onClick={() => toggle(a.id)}
                      className="flex items-center gap-2 flex-1 text-left min-w-0"
                    >
                      <ClipboardList className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="font-medium text-sm truncate">{a.routine?.name}</span>
                      {items.length > 0 && (
                        <span className="text-xs text-gray-400 shrink-0">({items.length} {t("clients", "exercisesCount")})</span>
                      )}
                      {isOpen
                        ? <ChevronUp className="h-4 w-4 text-gray-400 ml-auto shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-gray-400 ml-auto shrink-0" />}
                    </button>
                    <Link href={`/dashboard/rutinas/${a.routine?.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-7 shrink-0">{t("clients", "viewRoutine")}</Button>
                    </Link>
                    {/* Unassign button */}
                    <Button
                      variant="ghost" size="sm"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      title="Desasignar rutina"
                      onClick={() => setUnassignDialog({ assignmentId: a.id, routineName: a.routine?.name ?? "" })}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Exercises + notes (expanded) */}
                  {isOpen && (
                    items.length === 0 ? (
                      <div className="px-4 py-4 text-center text-xs text-gray-400">
                        {t("clients", "noExercisesInRoutine")}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {items.map((item, idx) => (
                          <div key={item.id} className="px-4 py-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-gray-400 w-5 shrink-0 mt-0.5">{idx + 1}</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm">{exDisplayName(item.exercise, lang)}</p>
                                <p className="text-xs text-gray-500">{item.sets} {t("routines", "setsX")} {item.reps}</p>
                              </div>
                            </div>
                            <div className="pl-7">
                              <RoutineNoteEditor item={item} clientId={client.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>

    {/* Unassign Confirmation Dialog */}
    {unassignDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h2 className="text-lg font-semibold mb-2">Desasignar rutina</h2>
          <p className="text-sm text-gray-600 mb-6">
            ¿Estás seguro de que quieres desasignar <strong>{unassignDialog.routineName}</strong> de este cliente?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setUnassignDialog(null)}
              disabled={isUnassigning}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUnassign}
              disabled={isUnassigning}
            >
              {isUnassigning ? "Desasignando..." : "Sí, desasignar"}
            </Button>
          </div>
        </div>
      </div>
    )}
  );
}

function InfoRow({ icon, label, value, className }: { icon: React.ReactNode; label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-start gap-2 text-sm ${className ?? ""}`}>
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );
}
