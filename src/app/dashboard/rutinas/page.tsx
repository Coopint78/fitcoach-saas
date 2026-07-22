import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RutinasPageView from "@/components/RutinasPageView";

export default async function RutinasPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: routines } = await supabase
    .from("routines")
    .select("*, routine_items(count)")
    .eq("trainer_id", trainer.id)
    .order("created_at", { ascending: false });

  return (
    <RutinasPageView
      routines={(routines ?? []).map(r => ({
        id: r.id,
        name: r.name,
        routine_items: (r.routine_items as unknown as { count: number }[]) ?? [],
      }))}
    />
  );
}
