import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Clock, XCircle, Settings } from "lucide-react";
import AdminTrainerRow from "@/components/AdminTrainerRow";
import AdminStripeConfig from "@/components/AdminStripeConfig";

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

  const all = trainers ?? [];
  const active = all.filter(t => t.subscription_status === "active").length;
  const trialing = all.filter(t => t.subscription_status === "trialing").length;
  const inactive = all.filter(t => !["active", "trialing"].includes(t.subscription_status)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestión de cuentas y configuración de plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Activos", count: active, icon: CheckCircle, color: "text-primary" },
          { label: "En prueba", count: trialing, icon: Clock, color: "text-amber-500" },
          { label: "Inactivos", count: inactive, icon: XCircle, color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-border">
            <CardContent className="p-5">
              <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
              <p className="text-3xl font-bold">{s.count}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trainer list */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Entrenadores ({all.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {all.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">Sin entrenadores registrados</p>
          ) : (
            <div className="divide-y divide-border">
              {all.map(trainer => (
                <AdminTrainerRow key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe config */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" /> Configuración de Stripe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminStripeConfig
            publishableKey={configMap["stripe_publishable_key"] ?? ""}
            secretKeyMasked={configMap["stripe_secret_key_masked"] ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
