import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalView from "@/components/PortalView";

export default async function PortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*, trainer:trainers(id, name, brand_color, connect_enabled, coaching_price_cents)")
    .eq("user_id", user.id)
    .single();

  if (!client) redirect("/login");

  const trainer = client.trainer as {
    id: string; name: string; brand_color: string;
    connect_enabled: boolean; coaching_price_cents: number;
  } | null;

  const [assignmentsRes, logsRes, sessionsRes] = await Promise.all([
    supabase.from("assignments").select("*, routine:routines(id, name, routine_items(*, exercise:exercises(*)))").eq("client_id", client.id),
    supabase.from("progress_logs").select("*").eq("client_id", client.id).gte("logged_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from("sessions").select("*").eq("client_id", client.id).gte("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true }).limit(10),
  ]);

  const completedIds = (logsRes.data ?? []).filter(l => l.completed).map(l => l.exercise_id);

  return (
    <PortalView
      clientName={client.name}
      clientId={client.id}
      trainerId={trainer?.id ?? ""}
      trainerName={trainer?.name ?? ""}
      clientGoal={client.goal ?? null}
      assignments={(assignmentsRes.data ?? []) as any}
      completedExerciseIds={completedIds}
      coachingStatus={client.coaching_subscription_status ?? null}
      coachingPriceCents={trainer?.coaching_price_cents ?? 0}
      connectEnabled={trainer?.connect_enabled ?? false}
      upcomingSessions={(sessionsRes.data ?? []) as any}
    />
  );
}
