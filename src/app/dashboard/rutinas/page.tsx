import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ClipboardList } from "lucide-react";

export default async function RutinasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: routines } = await supabase
    .from("routines")
    .select("*, routine_items(count)")
    .eq("trainer_id", trainer.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rutinas</h1>
          <p className="text-sm text-gray-600">{routines?.length ?? 0} rutina{routines?.length !== 1 ? "s" : ""} creada{routines?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/rutinas/nueva">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nueva rutina</Button>
        </Link>
      </div>

      {(!routines || routines.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">Sin rutinas todavía</h3>
          <p className="text-sm text-gray-500 mb-6">Creá rutinas para asignar a tus clientes</p>
          <Link href="/dashboard/rutinas/nueva">
            <Button><Plus className="h-4 w-4 mr-2" /> Crear primera rutina</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((r) => (
            <Link key={r.id} href={`/dashboard/rutinas/${r.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {(r.routine_items as unknown as {count: number}[])?.[0]?.count ?? 0} ejercicio{((r.routine_items as unknown as {count: number}[])?.[0]?.count ?? 0) !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
