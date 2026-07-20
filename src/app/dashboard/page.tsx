import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, Layers, Plus, AlertCircle } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {trainer.name.split(" ")[0]} 👋</h1>
          <p className="text-gray-600 text-sm mt-1">Aquí está el resumen de tu negocio</p>
        </div>
      </div>

      {isTrialing && daysLeft <= 7 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Tu período de prueba termina en {daysLeft} días
            </p>
            <p className="text-xs text-amber-700">Suscribite para no perder el acceso</p>
          </div>
          <Link href="/dashboard/suscripcion">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Suscribirme</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Clientes</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientCount ?? 0}</div>
            <Link href="/dashboard/clientes/nuevo">
              <Button variant="link" className="px-0 text-xs text-indigo-600 h-auto mt-1">+ Agregar cliente</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rutinas</CardTitle>
            <ClipboardList className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{routineCount ?? 0}</div>
            <Link href="/dashboard/rutinas/nueva">
              <Button variant="link" className="px-0 text-xs text-indigo-600 h-auto mt-1">+ Nueva rutina</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ejercicios</CardTitle>
            <Layers className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exerciseCount ?? 0}</div>
            <Link href="/dashboard/ejercicios">
              <Button variant="link" className="px-0 text-xs text-indigo-600 h-auto mt-1">Administrar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between flex-row">
            <CardTitle className="text-base">Accesos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/clientes/nuevo" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" /> Agregar cliente
              </Button>
            </Link>
            <Link href="/dashboard/rutinas/nueva" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" /> Crear rutina
              </Button>
            </Link>
            <Link href="/dashboard/ejercicios" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" /> Agregar ejercicio
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Plan actual</span>
              <Badge variant={isTrialing ? "secondary" : "default"}>
                {isTrialing ? `Prueba (${daysLeft}d)` : "Pro activo"}
              </Badge>
            </div>
            {isTrialing && (
              <Link href="/dashboard/suscripcion">
                <Button className="w-full mt-2">Activar suscripción — $29/mes</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
