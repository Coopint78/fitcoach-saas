"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ExternalLink, CreditCard, DollarSign } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  coaching_subscription_status: string | null;
};

type Trainer = {
  connect_account_id: string | null;
  connect_enabled: boolean | null;
  coaching_price_cents: number | null;
} | null;

export default function ConnectView({ trainer, clients }: { trainer: Trainer; clients: Client[] }) {
  const [price, setPrice] = useState(
    trainer?.coaching_price_cents ? (trainer.coaching_price_cents / 100).toFixed(2) : ""
  );
  const [savingPrice, setSavingPrice] = useState(false);
  const [sendingPayment, setSendingPayment] = useState<string | null>(null);

  const connected = trainer?.connect_enabled;

  async function handleSavePrice() {
    setSavingPrice(true);
    const res = await fetch("/api/stripe/connect/update-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price_usd: price }),
    });
    const data = await res.json();
    setSavingPrice(false);
    if (data.ok) toast.success("Precio actualizado");
    else toast.error(data.error ?? "Error al guardar");
  }

  async function handleSendPaymentLink(clientId: string) {
    setSendingPayment(clientId);
    const res = await fetch("/api/stripe/connect/client-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });
    const data = await res.json();
    setSendingPayment(null);
    if (data.url) {
      await navigator.clipboard.writeText(data.url);
      toast.success("¡Link de pago copiado al portapapeles!");
    } else {
      toast.error(data.error ?? "Error al generar el link");
    }
  }

  function statusBadge(status: string | null) {
    if (status === "active") return <Badge className="bg-green-100 text-green-700">Activo</Badge>;
    if (status === "trialing") return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>;
    if (status === "past_due") return <Badge variant="destructive">Vencido</Badge>;
    if (status === "canceled") return <Badge variant="outline">Cancelado</Badge>;
    return <Badge variant="outline" className="text-gray-400">Sin suscripción</Badge>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-indigo-600" /> Cobros a clientes
      </h1>

      {/* Onboarding card */}
      <Card className={connected ? "border-green-300" : "border-yellow-300"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {connected ? <CheckCircle className="h-5 w-5 text-green-500" /> : <ExternalLink className="h-5 w-5 text-yellow-500" />}
            {connected ? "Stripe conectado" : "Conectar cuenta de Stripe"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connected ? (
            <p className="text-sm text-gray-600">Tu cuenta está activa. Podés generar links de pago para tus clientes.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Conectá tu cuenta de Stripe para cobrar a tus clientes. FitCoach retiene un 10% de comisión.
              </p>
              <Link href="/dashboard/connect/onboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <ExternalLink className="h-4 w-4 mr-2" /> Conectar con Stripe
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" /> Precio mensual de coaching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">Este precio se cobra mensualmente a cada cliente que actives.</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="price">Precio (USD/mes)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="pl-7"
                  placeholder="50.00"
                />
              </div>
            </div>
            <Button onClick={handleSavePrice} disabled={savingPrice || !connected}>
              {savingPrice ? "Guardando…" : "Guardar"}
            </Button>
          </div>
          {!connected && <p className="text-xs text-yellow-600">Conectá Stripe primero para guardar el precio.</p>}
        </CardContent>
      </Card>

      {/* Clients list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Clientes y estado de pago</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-gray-400">No tenés clientes aún.</p>
          ) : (
            <div className="divide-y">
              {clients.map(c => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(c.coaching_subscription_status)}
                    {c.coaching_subscription_status !== "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!connected || !trainer?.coaching_price_cents || sendingPayment === c.id}
                        onClick={() => handleSendPaymentLink(c.id)}
                      >
                        {sendingPayment === c.id ? "…" : "Generar link"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
