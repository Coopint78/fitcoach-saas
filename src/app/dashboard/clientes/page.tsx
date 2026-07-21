import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ClientsView from "@/components/ClientsView";
import ClientesPageHeader from "@/components/ClientesPageHeader";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, goal, user_id, phone, birthdate, gender")
    .eq("trainer_id", trainer.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <ClientesPageHeader count={clients?.length ?? 0} />
      <ClientsView clients={clients ?? []} />
    </div>
  );
}
