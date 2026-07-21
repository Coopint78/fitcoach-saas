"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Video } from "lucide-react";
import ProgressButton from "@/components/ProgressButton";
import LogoutButton from "@/components/LogoutButton";
import { useLanguage } from "@/lib/i18n/context";

type Exercise = { id: string; name: string; description: string | null; video_url: string | null };
type RoutineItem = { id: string; exercise_id: string; sets: number; reps: string; order: number; exercise: Exercise };
type Routine = { id: string; name: string; routine_items: RoutineItem[] };
type Assignment = { id: string; routine: Routine };

type Props = {
  clientName: string;
  trainerName: string;
  clientGoal: string | null;
  assignments: Assignment[];
  completedExerciseIds: string[];
};

export default function PortalView({ clientName, trainerName, clientGoal, assignments, completedExerciseIds }: Props) {
  const { t } = useLanguage();
  const completedSet = new Set(completedExerciseIds);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <Dumbbell className="h-5 w-5" /> FitCoach
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{clientName}</p>
            <p className="text-xs text-gray-500">{t("portal", "trainer").replace("{name}", trainerName)}</p>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("portal", "myRoutines")}</h1>
          {clientGoal && <p className="text-sm text-gray-600 mt-1">{t("portal", "goal").replace("{goal}", clientGoal)}</p>}
        </div>

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
                    return (
                      <div key={item.id} className={`p-4 rounded-lg border transition-colors ${isCompleted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold text-gray-400 mt-1 w-5">{idx + 1}</span>
                            <div className="space-y-1">
                              <p className={`font-semibold text-sm ${isCompleted ? "text-green-700 line-through" : "text-gray-900"}`}>
                                {item.exercise?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.sets} {t("portal", "setsX")} {item.reps}
                              </p>
                              {item.exercise?.description && (
                                <p className="text-xs text-gray-500">{item.exercise.description}</p>
                              )}
                              {item.exercise?.video_url && (
                                <a href={item.exercise.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                                  <Video className="h-3 w-3" /> {t("portal", "watchVideo")}
                                </a>
                              )}
                            </div>
                          </div>
                          <ProgressButton
                            clientId={a.id}
                            exerciseId={item.exercise_id}
                            isCompleted={isCompleted}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
