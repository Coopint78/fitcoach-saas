"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      toast.error(data.error ?? "Error al restablecer la contraseña");
    }
    setLoading(false);
  }

  if (!token) return (
    <p className="text-center text-red-500">Link inválido. Solicitá un nuevo link de recuperación.</p>
  );

  if (done) return (
    <div className="text-center space-y-2">
      <p className="text-green-600 font-semibold">¡Contraseña actualizada!</p>
      <p className="text-sm text-gray-500">Redirigiendo al login...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>Nueva contraseña</Label>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres" />
      </div>
      <div className="space-y-1">
        <Label>Confirmar contraseña</Label>
        <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={6} placeholder="Repetí la contraseña" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Actualizando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
          <p className="text-sm text-gray-500">Ingresá tu nueva contraseña</p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-gray-400">Cargando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
