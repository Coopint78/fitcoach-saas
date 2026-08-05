import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PublicProfileEditor from "@/components/PublicProfileEditor";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, name, bio, specialty, location_country, location_state, location_city, location_zip_code, instagram, website, profile_photo, public_profile")
    .eq("user_id", user.id)
    .single();

  if (!trainer) redirect("/login");
  return <PublicProfileEditor trainer={trainer} />;
}
