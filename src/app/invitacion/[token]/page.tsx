"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function InvitacionPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [client, setClient] = useState<{ name: string; email: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const res = await fetch(`/api/invitacion?token=${token}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      if (data.user_id) { router.push("/portal"); return; }
      setClient({ name: data.name, email: data.email });
    }
    checkToken();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: client!.email,
      password,
      options: { data: { role: "client", name: client!.name } },
    });

    if (error || !authData.user) {
      toast.error(error?.message ?? "Error al crear cuenta");
      setLoading(false);
      return;
    }

    // Usar API con service_role para actualizar user_id sin restricción de RLS
    await fetch("/api/invitacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId: authData.user.id }),
    });

    setDone(true);
    setLoading(false);
  }

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full text-center p-6">
        <p className="text-gray-600">Invitación no válida o ya usada.</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>Ir al inicio</Button>
      </Card>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full text-center p-6 space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold">¡Cuenta creada!</h2>
        <p className="text-gray-600">Ya podés ver tus rutinas.</p>
        <Button onClick={() => router.push("/portal")} className="w-full">Ver mis rutinas</Button>
      </Card>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-xl text-indigo-600 mb-2">
            <Dumbbell className="h-6 w-6" /> FitCoach
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Hola, {client.name} 👋</CardTitle>
            <CardDescription>Tu entrenador te invitó a FitCoach. Creá tu contraseña para acceder a tus rutinas.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={client.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-1">
                <Label>Elegí una contraseña</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mín. 6 caracteres" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creando cuenta..." : "Activar mi cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
