import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Target, FileText, ClipboardList } from "lucide-react";
import AssignRoutineButton from "@/components/AssignRoutineButton";
import CopyLinkButton from "@/components/CopyLinkButton";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) redirect("/login");

  const { data: client } = await supabase.from("clients").select("*").eq("id", id).eq("trainer_id", trainer.id).single();
  if (!client) notFound();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, routine:routines(id, name)")
    .eq("client_id", client.id);

  const { data: routines } = await supabase.from("routines").select("id, name").eq("trainer_id", trainer.id);

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${client.invite_token}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clientes">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
        <Badge className="ml-auto" variant={client.user_id ? "default" : "secondary"}>
          {client.user_id ? "Cuenta activa" : "Sin cuenta"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Información</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
              <span>{client.email}</span>
            </div>
            {client.goal && (
              <div className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-indigo-500 mt-0.5" />
                <span>{client.goal}</span>
              </div>
            )}
            {client.notes && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{client.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {!client.user_id && (
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invitación</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-600">El cliente aún no creó su cuenta. Compartí este link:</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <code className="text-xs text-gray-700 flex-1 break-all">{inviteLink}</code>
              </div>
              <CopyLinkButton link={inviteLink} />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            Rutinas asignadas
          </CardTitle>
          <AssignRoutineButton clientId={client.id} routines={routines ?? []} existingAssignments={assignments?.map(a => a.routine_id) ?? []} />
        </CardHeader>
        <CardContent>
          {(!assignments || assignments.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-6">Aún no hay rutinas asignadas</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium text-sm">{(a.routine as { id: string; name: string })?.name}</span>
                  </div>
                  <Link href={`/dashboard/rutinas/${(a.routine as { id: string; name: string })?.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">Ver rutina</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

