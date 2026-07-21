"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConnectReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "enabled" | "pending">("loading");

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: trainer } = await supabase.from("trainers").select("connect_enabled").eq("user_id", user.id).single();
      setStatus(trainer?.connect_enabled ? "enabled" : "pending");
    }
    check();
  }, [router]);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><p className="animate-pulse text-gray-500">Verificando…</p></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      {status === "enabled" ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900">¡Stripe conectado!</h1>
          <p className="text-gray-600 text-center max-w-sm">Tu cuenta está activa. Ya podés cobrar a tus clientes desde la plataforma.</p>
        </>
      ) : (
        <>
          <Clock className="h-16 w-16 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-900">Verificación en proceso</h1>
          <p className="text-gray-600 text-center max-w-sm">Stripe está revisando tu información. Te notificaremos cuando esté lista. Puede demorar unos minutos.</p>
        </>
      )}
      <Link href="/dashboard/connect">
        <Button>Ir a cobros</Button>
      </Link>
    </div>
  );
}
