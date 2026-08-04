"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Video, MessageCircle, ClipboardList, TrendingUp, Calendar, CreditCard, CheckCircle, Clock, Globe } from "lucide-react";
import ProgressButton from "@/components/ProgressButton";
import LogoutButton from "@/components/LogoutButton";
import ChatWindow from "@/components/ChatWindow";
import ProgressTracker from "@/components/ProgressTracker";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Exercise = {
  id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  is_system?: boolean;
  image_url?: string | null;
  image_url_end?: string | null;
  name_es?: string | null;
  name_en?: string | null;
  description_es?: string | null;
  description_en?: string | null;
};
type RoutineItem = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  order: number;
  coach_notes?: string | null;
  exercise: Exercise;
};
type Routine = { id: string; name: string; routine_items: RoutineItem[] };
type Assignment = { id: string; routine: Routine };
type Session = { id: string; scheduled_at: string; duration_minutes: number; title: string | null; status: string };

type Props = {
  clientName: string;
  clientId: string;
  trainerId: string;
  trainerName: string;
  clientGoal: string | null;
  assignments: Assignment[];
  completedExerciseIds: string[];
  coachingStatus: string | null;
  coachingPriceCents: number;
  connectEnabled: boolean;
  upcomingSessions: Session[];
};

function exName(ex: Exercise, lang: string): string {
  if (lang === "en") return ex.name_en ?? ex.name;
  return ex.name_es ?? ex.name;
}

function exDesc(ex: Exercise, lang: string): string | null {
  if (lang === "en") return ex.description_en ?? ex.description;
  return ex.description_es ?? ex.description;
}

export default function PortalView({
  clientName, clientId, trainerId, trainerName, clientGoal,
  assignments, completedExerciseIds, coachingStatus,
  coachingPriceCents, connectEnabled, upcomingSessions,
}: Props) {
  const { t, lang, setLang } = useLanguage();
  const completedSet = new Set(completedExerciseIds);
  const [tab, setTab] = useState<"routines" | "chat" | "progress" | "sessions" | "payments">("routines");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Portal uses its own language preference, independent of the trainer dashboard.
  // This way trainer (ES) and client (EN browser) can each see their own language.
  useEffect(() => {
    const portalLang = localStorage.getItem("fitcoach-portal-lang") as "en" | "es" | null;
    if (portalLang) {
      setLang(portalLang);
    } else {
      const browserLang = navigator.language.toLowerCase().startsWith("en") ? "en" : "es";
      setLang(browserLang as "en" | "es");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLangToggle() {
    const newLang = lang === "es" ? "en" : "es";
    setLang(newLang as "en" | "es");
    localStorage.setItem("fitcoach-portal-lang", newLang);
  }

  const isCoachingActive = coachingStatus === "active";

  async function handleCoachingCheckout() {
    setCheckoutLoading(true);
    const res = await fetch("/api/portal/coaching-checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Error al iniciar el pago");
    setCheckoutLoading(false);
  }

  const tabs = [
    { key: "routines", label: t("portal", "myRoutines"), icon: ClipboardList },
    { key: "sessions", label: t("portal", "tabSessions"), icon: Calendar },
    { key: "chat", label: t("portal", "tabChat"), icon: MessageCircle },
    { key: "progress", label: t("portal", "tabProgress"), icon: TrendingUp },
    { key: "payments", label: t("portal", "tabPayments"), icon: CreditCard },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <Dumbbell className="h-5 w-5" /> FitCoach
        </div>
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={handleLangToggle}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors"
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "es" ? "EN" : "ES"}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">{clientName}</p>
            <p className="text-xs text-gray-500">{t("portal", "trainer").replace("{name}", trainerName)}</p>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Tab switcher */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={tab === key ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(key)}
              className={cn("gap-1.5 rounded-xl", tab === key && "bg-indigo-600 hover:bg-indigo-700")}
            >
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
        </div>

        {/* Routines tab */}
        {tab === "routines" && (
          <>
            {clientGoal && <p className="text-sm text-gray-600">{t("portal", "goal").replace("{goal}", clientGoal)}</p>}
            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-600 mb-2">{t("portal", "noRoutines")}</h3>
                <p className="text-sm text-gray-500">{t("portal", "noRoutinesDesc")}</p>
              </div>
            ) : (
              assignments.map((a) => {
                const routine = a.routine;
                const items = (routine.routine_items ?? []).sort((x, y) => x.order - y.order);
                const completedCount = items.filter(i => completedSet.has(i.exercise_id)).length;
                return (
                  <Card key={a.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{routine.name}</CardTitle>
                        <Badge variant="secondary">
                          {t("portal", "completed").replace("{done}", String(completedCount)).replace("{total}", String(items.length))}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {items.map((item, idx) => {
                        const isCompleted = completedSet.has(item.exercise_id);
                        const ex = item.exercise;
                        const name = ex ? exName(ex, lang) : "";
                        const desc = ex ? exDesc(ex, lang) : null;
                        const hasImage = ex?.is_system && ex?.image_url;

                        return (
                          <div key={item.id} className={`rounded-xl border overflow-hidden transition-colors ${isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                            {/* Exercise images (library only) */}
                            {hasImage && (
                              <div className="flex h-32 border-b border-gray-100">
                                <img
                                  src={ex.image_url!}
                                  alt={name}
                                  className="w-1/2 object-cover"
                                />
                                {ex.image_url_end ? (
                                  <img
                                    src={ex.image_url_end}
                                    alt={name}
                                    className="w-1/2 object-cover border-l border-gray-100"
                                  />
                                ) : (
                                  <div className="w-1/2 bg-gray-50" />
                                )}
                              </div>
                            )}

                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <span className="text-xs font-bold text-gray-400 mt-0.5 w-5 shrink-0">{idx + 1}</span>
                                  <div className="space-y-1">
                                    <p className={`font-semibold text-sm ${isCompleted ? "text-green-700 line-through" : "text-gray-900"}`}>{name}</p>
                                    <p className="text-xs text-gray-600">{item.sets} {t("portal", "setsX")} {item.reps}</p>
                                    {desc && <p className="text-xs text-gray-500">{desc}</p>}

                                    {/* Coach notes */}
                                    {item.coach_notes && (
                                      <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">{t("portal", "coachNotes")}</p>
                                        <p className="text-xs text-indigo-700">{item.coach_notes}</p>
                                      </div>
                                    )}

                                    {ex?.video_url && (
                                      <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                                        <Video className="h-3 w-3" /> {t("portal", "watchVideo")}
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <ProgressButton clientId={clientId} exerciseId={item.exercise_id} isCompleted={isCompleted} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </>
        )}

        {/* Sessions tab */}
        {tab === "sessions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">{t("portal", "tabSessions")}</h2>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">{t("portal", "noSessions")}</p>
              </div>
            ) : (
              upcomingSessions.map((s) => {
                const date = new Date(s.scheduled_at);
                return (
                  <Card key={s.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-50 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-600">{date.toLocaleDateString(lang === "en" ? "en-US" : "es", { month: "short" }).toUpperCase()}</span>
                        <span className="text-lg font-bold text-indigo-700">{date.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{s.title ?? "Sesión con entrenador"}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {date.toLocaleTimeString(lang === "en" ? "en-US" : "es", { hour: "2-digit", minute: "2-digit" })} · {s.duration_minutes} min
                        </p>
                      </div>
                      <Badge className={s.status === "completed" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}>
                        {s.status === "completed" ? (lang === "en" ? "Completed" : "Completada") : s.status === "cancelled" ? (lang === "en" ? "Cancelled" : "Cancelada") : (lang === "en" ? "Confirmed" : "Confirmada")}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Chat tab */}
        {tab === "chat" && (
          <ChatWindow trainerId={trainerId} clientId={clientId} myRole="client" clientName={trainerName} />
        )}

        {/* Progress tab */}
        {tab === "progress" && <ProgressTracker clientId={clientId} />}

        {/* Payments tab */}
        {tab === "payments" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Coaching</h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{lang === "en" ? "Coaching subscription" : "Suscripción de coaching"}</p>
                    <p className="text-sm text-gray-500">{lang === "en" ? `with ${trainerName}` : `con ${trainerName}`}</p>
                  </div>
                  <Badge className={isCoachingActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                    {isCoachingActive ? (lang === "en" ? "Active" : "Activa") : coachingStatus === "past_due" ? (lang === "en" ? "Past due" : "Vencida") : (lang === "en" ? "No subscription" : "Sin suscripción")}
                  </Badge>
                </div>

                {isCoachingActive ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>{lang === "en" ? "Your coaching subscription is active. Payment renews automatically each month." : "Tu suscripción de coaching está activa. El pago se renueva automáticamente cada mes."}</span>
                  </div>
                ) : connectEnabled && coachingPriceCents >= 100 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {lang === "en" ? "Monthly price:" : "Precio mensual:"} <span className="font-bold">${(coachingPriceCents / 100).toFixed(2)} USD/mes</span>
                    </p>
                    <Button onClick={handleCoachingCheckout} disabled={checkoutLoading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <CreditCard className="h-4 w-4" />
                      {checkoutLoading ? (lang === "en" ? "Redirecting..." : "Redirigiendo...") : (lang === "en" ? "Activate coaching subscription" : "Activar suscripción de coaching")}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">{lang === "en" ? "Your trainer hasn't set up payments on the platform yet." : "Tu entrenador aún no configuró los pagos en la plataforma."}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
