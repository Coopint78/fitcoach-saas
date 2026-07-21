import { createClient } from "@/lib/supabase/server";
import TrainerDirectory from "@/components/TrainerDirectory";

export const revalidate = 60;

export default async function EntrenadoresPage() {
  const supabase = await createClient();
  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name, bio, specialty, location, profile_photo, instagram, website, coaching_price_cents, connect_enabled, client_count")
    .eq("public_profile", true)
    .order("name");

  return <TrainerDirectory trainers={trainers ?? []} />;
}
