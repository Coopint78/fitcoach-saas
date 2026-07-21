import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TrainerProfile from "@/components/TrainerProfile";

export const revalidate = 60;

export default async function TrainerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, name, bio, specialty, location, profile_photo, instagram, website, coaching_price_cents, connect_enabled, client_count")
    .eq("id", id)
    .eq("public_profile", true)
    .single();

  if (!trainer) notFound();
  return <TrainerProfile trainer={trainer} />;
}
