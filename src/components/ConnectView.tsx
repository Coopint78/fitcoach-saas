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
import { useLanguage } from "@/lib/i18n/context";

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
  const { t } = useLanguage();
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
    if (data.ok) toast.success(t("connect", "priceSaved"));
    else toast.error(data.error ?? t("connect", "priceSaveError"));
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
      toast.success(t("connect", "linkCopied"));
    } else {
      toast.error(data.error ?? t("connect", "linkError"));
    }
  }

  function statusBadge(status: string | null) {
    if (status === "active") return <Badge className="bg-green-100 text-green-700">{t("connect", "statusActive")}</Badge>;
    if (status === "trialing") return <Badge className="bg-blue-100 text-blue-700">{t("connect", "statusTrialing")}</Badge>;
    if (status === "past_due") return <Badge variant="destructive">{t("connect", "statusPastDue")}</Badge>;
    if (status === "canceled") return <Badge variant="outline">{t("connect", "statusCanceled")}</Badge>;
    return <Badge variant="outline" className="text-gray-400">{t("connect", "statusNone")}</Badge>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-indigo-600" /> {t("connect", "title")}
      </h1>

      {/* Onboarding card */}
      <Card className={connected ? "border-green-300" : "border-yellow-300"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {connected
              ? <CheckCircle className="h-5 w-5 text-green-500" />
              : <ExternalLink className="h-5 w-5 text-yellow-500" />}
            {connected ? t("connect", "connectedTitle") : t("connect", "connectTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connected ? (
            <p className="text-sm text-gray-600">{t("connect", "connectedDesc")}</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{t("connect", "connectDesc")}</p>
              <Link href="/dashboard/connect/onboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  <ExternalLink className="h-4 w-4 mr-2" /> {t("connect", "connectBtn")}
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
            <DollarSign className="h-5 w-5 text-indigo-600" /> {t("connect", "priceTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">{t("connect", "priceDesc")}</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="price">{t("connect", "priceLabel")}</Label>
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
            <Button
              onClick={handleSavePrice}
              disabled={savingPrice || !connected}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
            >
              {savingPrice ? t("connect", "saving") : t("connect", "save")}
            </Button>
          </div>
          {!connected && <p className="text-xs text-yellow-600">{t("connect", "connectFirst")}</p>}
        </CardContent>
      </Card>

      {/* Clients list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("connect", "clientsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-sm text-gray-400">{t("connect", "noClients")}</p>
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
                        {sendingPayment === c.id ? "…" : t("connect", "generateLink")}
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
