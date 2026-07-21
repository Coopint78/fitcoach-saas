"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ConnectOnboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function start() {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Error al iniciar la conexión");
        router.push("/dashboard/connect");
      }
    }
    start();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 animate-pulse">Redirigiendo a Stripe…</p>
    </div>
  );
}
