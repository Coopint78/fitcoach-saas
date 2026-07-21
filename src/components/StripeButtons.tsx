"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

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
  const { t } = useLanguage();

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error(t("stripe", "errorCheckout"));
    setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.error(t("stripe", "errorPortal"));
    setLoading(false);
  }

  if (isActive && hasStripeCustomer) {
    return (
      <Button onClick={handlePortal} disabled={loading} variant="outline" className="gap-2">
        <ExternalLink className="h-4 w-4" />
        {loading ? t("stripe", "redirecting") : t("stripe", "manage")}
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className="gap-2">
      <CreditCard className="h-4 w-4" />
      {loading ? t("stripe", "redirecting") : t("stripe", "subscribe")}
    </Button>
  );
}
