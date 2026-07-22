import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConnectView from "@/components/ConnectView";

export default async function ConnectPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, connect_account_id, connect_enabled, coaching_price_cents")
    .eq("user_id", user.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, coaching_subscription_status")
    .eq("trainer_id", trainer?.id ?? "");

  return <ConnectView trainer={trainer} clients={clients ?? []} />;
}
