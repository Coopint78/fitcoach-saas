import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Video, LogOut } from "lucide-react";
import ProgressButton from "@/components/ProgressButton";
import LogoutButton from "@/components/LogoutButton";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*, trainer:trainers(name, brand_color)")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/login");

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, routine:routines(id, name, routine_items(*, exercise:exercises(*)))")
    .eq("client_id", client.id);

  const { data: logs } = await supabase
    .from("progress_logs")
    .select("*")
    .eq("client_id", client.id)
    .gte("logged_at", new Date(Date.now() - 7 * 86400000).toISOString());

  const completedExerciseIds = new Set(logs?.filter(l => l.completed).map(l => l.exercise_id) ?? []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-600">
          <Dumbbell className="h-5 w-5" /> FitCoach
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{client.name}</p>
            <p className="text-xs text-gray-500">Entrenador: {(client.trainer as { name: string })?.name}</p>
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis rutinas</h1>
          {client.goal && <p className="text-sm text-gray-600 mt-1">Objetivo: {client.goal}</p>}
        </div>

        {(!assignments || assignments.length === 0) ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">Sin rutinas asignadas todavía</h3>
            <p className="text-sm text-gray-500">Tu entrenador te asignará una rutina pronto</p>
          </div>
        ) : (
          assignments.map((a) => {
            const routine = a.routine as {
              id: string; name: string;
              routine_items: Array<{ id: string; exercise_id: string; sets: number; reps: string; order: number; exercise: { id: string; name: string; description: string | null; video_url: string | null } }>
            };
            const items = (routine.routine_items ?? []).sort((x, y) => x.order - y.order);
            const completedCount = items.filter(i => completedExerciseIds.has(i.exercise_id)).length;

            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{routine.name}</CardTitle>
                    <Badge variant="secondary">{completedCount}/{items.length} completados</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item, idx) => {
                    const isCompleted = completedExerciseIds.has(item.exercise_id);
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
                                {item.sets} series × {item.reps}
                              </p>
                              {item.exercise?.description && (
                                <p className="text-xs text-gray-500">{item.exercise.description}</p>
                              )}
                              {item.exercise?.video_url && (
                                <a href={item.exercise.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                                  <Video className="h-3 w-3" /> Ver video
                                </a>
                              )}
                            </div>
                          </div>
                          <ProgressButton
                            clientId={client.id}
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
