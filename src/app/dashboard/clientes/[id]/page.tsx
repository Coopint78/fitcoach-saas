import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ClienteDetailClient from "@/components/ClienteDetailClient";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, email, user_id, goal, notes, phone, birthdate, gender, height_cm, weight_kg, address, invite_token")
    .eq("id", id)
    .eq("trainer_id", trainer.id)
    .single();
  if (!client) notFound();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, routine_id, routine:routines(id, name)")
    .eq("client_id", client.id);

  const { data: routines } = await supabase.from("routines").select("id, name").eq("trainer_id", trainer.id);

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${client.invite_token}`;

  return (
    <ClienteDetailClient
      client={client}
      routines={routines ?? []}
      assignments={(assignments ?? []).map(a => ({ ...a, routine: Array.isArray(a.routine) ? (a.routine[0] ?? null) : a.routine })) as { id: string; routine_id: string; routine: { id: string; name: string } | null }[]}
      inviteLink={inviteLink}
    />
  );
}
