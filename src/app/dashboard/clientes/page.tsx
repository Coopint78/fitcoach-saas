import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Mail, Target } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("trainer_id", trainer.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 text-sm">{clients?.length ?? 0} cliente{clients?.length !== 1 ? "s" : ""} registrado{clients?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/clientes/nuevo">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Agregar cliente</Button>
        </Link>
      </div>

      {(!clients || clients.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">Aún no tenés clientes</h3>
          <p className="text-sm text-gray-500 mb-6">Agregá tu primer cliente y comenzá a asignarle rutinas</p>
          <Link href="/dashboard/clientes/nuevo">
            <Button><Plus className="h-4 w-4 mr-2" /> Agregar primer cliente</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clientes/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />{client.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={client.user_id ? "default" : "secondary"} className="text-xs">
                      {client.user_id ? "Activo" : "Invitado"}
                    </Badge>
                  </div>
                  {client.goal && (
                    <p className="text-xs text-gray-600 flex items-start gap-1">
                      <Target className="h-3 w-3 mt-0.5 flex-shrink-0 text-indigo-500" />
                      {client.goal}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
