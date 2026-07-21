import { createClient } from "@/lib/supabase/server";
import AdminPageView from "@/components/AdminPageView";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name, email, subscription_status, trial_ends_at, stripe_customer_id, created_at")
    .order("created_at", { ascending: false });

  const { data: config } = await supabase
    .from("platform_config")
    .select("key, value")
    .in("key", ["stripe_publishable_key", "stripe_secret_key_masked"]);

  const configMap: Record<string, string> = {};
  for (const row of config ?? []) configMap[row.key] = row.value;

  return (
    <AdminPageView
      trainers={trainers ?? []}
      publishableKey={configMap["stripe_publishable_key"] ?? ""}
      secretKeyMasked={configMap["stripe_secret_key_masked"] ?? ""}
    />
  );
}
