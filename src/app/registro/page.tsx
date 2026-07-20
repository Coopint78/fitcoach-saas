"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "trainer" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Revisá tu email para confirmar tu cuenta");
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-indigo-600 mb-6">
            <Dumbbell className="h-6 w-6" />
            FitCoach
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta de entrenador</CardTitle>
            <CardDescription>14 días de prueba gratuita, sin tarjeta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Juan García" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mín. 6 caracteres" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
