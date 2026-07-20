"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, ExternalLink } from "lucide-react";

export default function StripeButtons({
  trainerId,
  isActive,
  hasStripeCustomer,
}: {
  trainerId: string;
  isActive: boolean;
  hasStripeCustomer: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Error al iniciar checkout");
    setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error("Error al abrir portal");
    setLoading(false);
  }

  if (isActive && hasStripeCustomer) {
    return (
      <Button onClick={handlePortal} disabled={loading} variant="outline" className="gap-2">
        <ExternalLink className="h-4 w-4" />
        {loading ? "Redirigiendo..." : "Gestionar suscripción en Stripe"}
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className="gap-2">
      <CreditCard className="h-4 w-4" />
      {loading ? "Redirigiendo..." : "Suscribirme — $29/mes"}
    </Button>
  );
}
