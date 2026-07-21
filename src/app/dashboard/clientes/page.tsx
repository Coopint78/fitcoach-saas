import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ClientsView from "@/components/ClientsView";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 text-sm">{clients?.length ?? 0} cliente{clients?.length !== 1 ? "s" : ""} registrado{clients?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/clientes/nuevo">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Agregar cliente</Button>
        </Link>
      </div>
      <ClientsView clients={clients ?? []} />
    </div>
  );
}
