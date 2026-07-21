import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Zap } from "lucide-react";
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

  const features = ["Clientes ilimitados", "Rutinas y ejercicios ilimitadas", "Portal del cliente", "Seguimiento de progreso"];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">Cuenta</p>
        <h1 className="text-2xl font-bold">Suscripción</h1>
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Plan actual</p>
                <p className="text-xs text-muted-foreground">FitCoach Pro</p>
              </div>
            </div>
            <Badge className={isActive ? "bg-primary/15 text-primary border-primary/20 font-semibold" : "bg-muted text-muted-foreground font-semibold"}>
              {isActive ? "Activo" : isTrialing ? `Prueba — ${daysLeft}d` : "Inactivo"}
            </Badge>
          </div>

          {(isActive || isTrialing) && (
            <div className="space-y-2.5 pt-2 border-t border-border">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <StripeButtons trainerId={trainer.id} isActive={isActive} hasStripeCustomer={!!trainer.stripe_customer_id} />
          </div>

          {isTrialing && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
              <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" fill="currentColor" />
              <div>
                <p className="text-sm font-semibold">Quedan {daysLeft} días de prueba</p>
                <p className="text-xs text-muted-foreground mt-0.5">Activá tu plan para seguir usando FitCoach sin interrupciones</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
