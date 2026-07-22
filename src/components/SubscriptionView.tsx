"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, CreditCard, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import StripeButtons from "@/components/StripeButtons";
import Link from "next/link";

type Props = {
  trainerId: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
};

const TRIAL_FEATURES = [
  { es: "Hasta 5 clientes", en: "Up to 5 clients" },
  { es: "Ejercicios y rutinas ilimitadas", en: "Unlimited exercises and routines" },
  { es: "Portal del cliente incluido", en: "Client portal included" },
  { es: "Seguimiento de progreso", en: "Progress tracking" },
];

const STARTER_FEATURES = [
  { es: "Hasta 10 clientes", en: "Up to 10 clients" },
  { es: "Ejercicios y rutinas ilimitadas", en: "Unlimited exercises and routines" },
  { es: "Portal del cliente incluido", en: "Client portal included" },
  { es: "Seguimiento de progreso", en: "Progress tracking" },
  { es: "Soporte por email", en: "Email support" },
];

const PRO_FEATURES = [
  { es: "Clientes ilimitados", en: "Unlimited clients" },
  { es: "Ejercicios y rutinas ilimitadas", en: "Unlimited exercises and routines" },
  { es: "Portal del cliente incluido", en: "Client portal included" },
  { es: "Seguimiento de progreso", en: "Progress tracking" },
  { es: "Soporte prioritario", en: "Priority support" },
];

export default function SubscriptionView({ trainerId, subscriptionStatus, trialEndsAt, stripeCustomerId }: Props) {
  const { lang, t } = useLanguage();

  const isActive = subscriptionStatus === "active";
  const isStarter = subscriptionStatus === "starter";
  const isTrialing = subscriptionStatus === "trialing";
  const trialEnds = trialEndsAt ? new Date(trialEndsAt) : null;
  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / 86400000)) : 0;

  const badgeLabel = isActive
    ? t("subscription", "active")
    : isStarter
    ? t("subscription", "starter")
    : isTrialing
    ? t("subscription", "trialing").replace("{n}", String(daysLeft))
    : t("subscription", "inactive");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("subscription", "account")}</p>
        <h1 className="text-2xl font-bold">{t("subscription", "title")}</h1>
      </div>

      {/* Current status card */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("subscription", "currentPlan")}</p>
                <p className="text-xs text-muted-foreground">{t("subscription", "planDesc")}</p>
              </div>
            </div>
            <Badge className={(isActive || isStarter) ? "bg-primary/15 text-primary border-primary/20 font-semibold" : "bg-muted text-muted-foreground font-semibold"}>
              {badgeLabel}
            </Badge>
          </div>

          <div className="pt-2">
            <StripeButtons trainerId={trainerId} isActive={isActive || isStarter} hasStripeCustomer={!!stripeCustomerId} />
          </div>

          {isTrialing && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
              <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" fill="currentColor" />
              <div>
                <p className="text-sm font-semibold">{t("subscription", "trialLeft").replace("{n}", String(daysLeft))}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("subscription", "trialLeftSub")}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans side by side */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Trial */}
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{t("subscription", "trialPlan")}</p>
                <p className="text-xs text-muted-foreground">{t("subscription", "trialPlanDesc")}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t("subscription", "trialIncludes")}</p>
            <div className="space-y-2">
              {TRIAL_FEATURES.map((f) => (
                <div key={f.es} className="flex items-center gap-2.5 text-sm">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                  </div>
                  {lang === "en" ? f.en : f.es}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground border-t border-border pt-3">{t("subscription", "trialLimit")}</p>
          </CardContent>
        </Card>

        {/* Starter */}
        <Card className={`rounded-2xl border-2 ${isStarter ? "border-primary/40" : "border-border"}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("subscription", "starterPlan")}</p>
                  <p className="text-xs text-muted-foreground">$19{t("subscription", "priceUnit")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {STARTER_FEATURES.map((f) => (
                <div key={f.es} className="flex items-center gap-2.5 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  {lang === "en" ? f.en : f.es}
                </div>
              ))}
            </div>
            {!isStarter && !isActive && (
              <StripeButtons trainerId={trainerId} isActive={false} hasStripeCustomer={!!stripeCustomerId} plan="starter" />
            )}
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className={`rounded-2xl border-2 ${isActive ? "border-primary/40" : "border-border"}`}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" fill="currentColor" />
                </div>
                <div>
                  <p className="font-semibold">{t("subscription", "paidPlan")}</p>
                  <p className="text-xs text-muted-foreground">$29{t("subscription", "priceUnit")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <div key={f.es} className="flex items-center gap-2.5 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  {lang === "en" ? f.en : f.es}
                </div>
              ))}
            </div>
            {(!isActive && !isStarter) && (
              <StripeButtons trainerId={trainerId} isActive={false} hasStripeCustomer={!!stripeCustomerId} plan="pro" />
            )}
            {isStarter && (
              <StripeButtons trainerId={trainerId} isActive={false} hasStripeCustomer={!!stripeCustomerId} plan="pro" />
            )}
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground text-center pt-2">
        {lang === "en" ? "By using FitCoach you agree to our" : "Al usar FitCoach aceptás nuestros"}{" "}
        <Link href="/terminos" className="underline hover:text-foreground transition-colors">
          {lang === "en" ? "Terms and Conditions" : "Términos y Condiciones"}
        </Link>.
      </p>
    </div>
  );
}
