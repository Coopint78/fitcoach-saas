import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SessionsView from "@/components/SessionsView";
import AvailabilityEditor from "@/components/AvailabilityEditor";

export default async function SesionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/dashboard");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("trainer_id", trainer.id)
    .order("name");

  return (
    <div className="space-y-12">
      <SessionsView clients={clients ?? []} />
      <hr className="border-border" />
      <AvailabilityEditor />
    </div>
  );
}
