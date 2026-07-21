import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalView from "@/components/PortalView";

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

  const completedIds = (logs ?? []).filter(l => l.completed).map(l => l.exercise_id);
  const trainerName = (client.trainer as { name: string } | null)?.name ?? "";

  return (
    <PortalView
      clientName={client.name}
      trainerName={trainerName}
      clientGoal={client.goal ?? null}
      assignments={(assignments ?? []) as any}
      completedExerciseIds={completedIds}
    />
  );
}
