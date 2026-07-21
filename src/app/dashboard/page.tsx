import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList, Layers, Plus, AlertCircle, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("*").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const [{ count: clientCount }, { count: routineCount }, { count: exerciseCount }] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
    supabase.from("routines").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
    supabase.from("exercises").select("*", { count: "exact", head: true }).eq("trainer_id", trainer.id),
  ]);

  const trialEnds = trainer.trial_ends_at ? new Date(trainer.trial_ends_at) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;
  const isTrialing = trainer.subscription_status === "trialing";
  const firstName = trainer.name.split(" ")[0];

  const stats = [
    { label: "Clientes", count: clientCount ?? 0, icon: Users, href: "/dashboard/clientes", cta: "Agregar cliente", ctaHref: "/dashboard/clientes/nuevo" },
    { label: "Rutinas", count: routineCount ?? 0, icon: ClipboardList, href: "/dashboard/rutinas", cta: "Nueva rutina", ctaHref: "/dashboard/rutinas/nueva" },
    { label: "Ejercicios", count: exerciseCount ?? 0, icon: Layers, href: "/dashboard/ejercicios", cta: "Nuevo ejercicio", ctaHref: "/dashboard/ejercicios" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-3xl font-bold">Hola, {firstName} 👋</h1>
      </div>

      {isTrialing && daysLeft <= 7 && (
        <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Prueba gratuita: {daysLeft} días restantes</p>
            <p className="text-xs text-muted-foreground">Suscribite para no perder el acceso</p>
          </div>
          <Link href="/dashboard/suscripcion" className="shrink-0">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl">
              Activar plan
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="rounded-2xl border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-4xl font-bold mb-1">{s.count}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Acciones rápidas</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <Link key={s.ctaHref} href={s.ctaHref}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl border-border hover:border-primary hover:bg-primary/5 font-medium"
              >
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                </div>
                {s.cta}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {isTrialing && (
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Plan de prueba activo</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {daysLeft > 0 ? `${daysLeft} días hasta que expire` : "Expiró hoy"}
              </p>
            </div>
            <Link href="/dashboard/suscripcion" className="shrink-0">
              <Button className="rounded-xl font-semibold">Ver planes → $29/mes</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
