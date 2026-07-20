import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard } from "lucide-react";
import StripeButtons from "@/components/StripeButtons";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const isActive = trainer.subscription_status === "active";
  const isTrialing = trainer.subscription_status === "trialing";
  const trialEnds = trainer.trial_ends_at ? new Date(trainer.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suscripción</h1>
        <p className="text-gray-600 text-sm mt-1">Gestioná tu plan y método de pago</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-600" /> Plan actual</CardTitle>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Activo" : isTrialing ? `Prueba — ${daysLeft}d restantes` : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isActive || isTrialing) && (
            <div className="space-y-2">
              {["Clientes ilimitados", "Rutinas y ejercicios ilimitados", "Portal del cliente", "Seguimiento de progreso"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" /> {f}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <StripeButtons
              trainerId={trainer.id}
              isActive={isActive}
              hasStripeCustomer={!!trainer.stripe_customer_id}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
