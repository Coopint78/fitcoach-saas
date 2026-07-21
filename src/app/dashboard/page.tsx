import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardView from "@/components/DashboardView";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const [{ count: clientCount }, { count: routineCount }, { count: exerciseCount }] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
    supabase.from("routines").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
    supabase.from("exercises").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
  ]);

  const trialEnds = trainer.trial_ends_at ? new Date(trainer.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;
  const isTrialing = trainer.subscription_status === "trialing";
  const firstName = trainer.name.split(" ")[0];

  return (
    <DashboardView
      firstName={firstName}
      clientCount={clientCount ?? 0}
      routineCount={routineCount ?? 0}
      exerciseCount={exerciseCount ?? 0}
      isTrialing={isTrialing}
      daysLeft={daysLeft}
    />
  );
}
