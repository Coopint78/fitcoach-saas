"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle, Settings } from "lucide-react";
import AdminTrainerRow from "@/components/AdminTrainerRow";
import AdminStripeConfig from "@/components/AdminStripeConfig";
import { useLanguage } from "@/lib/i18n/context";

type Trainer = {
  id: string;
  name: string;
  email: string;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

type Props = {
  trainers: Trainer[];
  publishableKey: string;
  secretKeyMasked: string;
};

export default function AdminPageView({ trainers, publishableKey, secretKeyMasked }: Props) {
  const { t } = useLanguage();

  const active = trainers.filter(tr => tr.subscription_status === "active").length;
  const trialing = trainers.filter(tr => tr.subscription_status === "trialing").length;
  const inactive = trainers.filter(tr => !["active", "trialing"].includes(tr.subscription_status)).length;

  const stats = [
    { label: t("admin", "active"), count: active, icon: CheckCircle, color: "text-primary" },
    { label: t("admin", "trial"), count: trialing, icon: Clock, color: "text-amber-500" },
    { label: t("admin", "inactive"), count: inactive, icon: XCircle, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("admin", "title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("admin", "desc")}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="rounded-2xl border-border">
            <CardContent className="p-5">
              <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
              <p className="text-3xl font-bold">{s.count}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> {t("admin", "trainers").replace("{n}", String(trainers.length))}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trainers.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">{t("admin", "noTrainers")}</p>
          ) : (
            <div className="divide-y divide-border">
              {trainers.map(trainer => (
                <AdminTrainerRow key={trainer.id} trainer={trainer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" /> {t("admin", "stripeConfig")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminStripeConfig
            publishableKey={publishableKey}
            secretKeyMasked={secretKeyMasked}
          />
        </CardContent>
      </Card>
    </div>
  );
}
