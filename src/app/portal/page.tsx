import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
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

  // Fetch per-client coach notes
  let coachNotesMap: Record<string, string> = {};
  try {
    const { rows } = await pool.query(
      `SELECT routine_item_id, notes FROM routine_item_notes WHERE client_id = $1`,
      [client.id]
    );
    rows.forEach((r: any) => { coachNotesMap[r.routine_item_id] = r.notes; });
  } catch { /* table may not exist yet */ }

  // Inject notes into routine_items
  const assignments = (assignmentsRes.data ?? []).map((a: any) => ({
    ...a,
    routine: a.routine ? {
      ...a.routine,
      routine_items: (a.routine.routine_items ?? []).map((ri: any) => ({
        ...ri,
        coach_notes: coachNotesMap[ri.id] ?? null,
      })),
    } : null,
  }));

  const completedIds = (logsRes.data ?? []).filter((l: any) => l.completed).map((l: any) => l.exercise_id);

  return (
    <PortalView
      clientName={client.name}
      clientId={client.id}
      trainerId={trainer?.id ?? ""}
      trainerName={trainer?.name ?? ""}
      clientGoal={client.goal ?? null}
      assignments={assignments as any}
      completedExerciseIds={completedIds}
      coachingStatus={client.coaching_subscription_status ?? null}
      coachingPriceCents={trainer?.coaching_price_cents ?? 0}
      connectEnabled={trainer?.connect_enabled ?? false}
      upcomingSessions={(sessionsRes.data ?? []) as any}
    />
  );
}
