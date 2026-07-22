"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const PLAN_LIMITS: Record<string, number | null> = {
  trialing: 5,
  starter: 10,
  active: null,
};

export default function ClientesPageHeader({ count, subscriptionStatus }: { count: number; subscriptionStatus: string }) {
  const { t } = useLanguage();
  const label = count === 1 ? t("clients", "count_one") : t("clients", "count_other");
  const limit = PLAN_LIMITS[subscriptionStatus] ?? null;
  const atLimit = limit !== null && count >= limit;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("clients", "title")}</h1>
        <p className="text-gray-600 text-sm">
          {count} {label}
          {limit !== null && <span className="ml-1 text-gray-400">/ {limit}</span>}
        </p>
      </div>
      {atLimit ? (
        <Link href="/dashboard/suscripcion">
          <Button variant="outline" className="gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50">
            {t("clients", "limitReached")}
          </Button>
        </Link>
      ) : (
        <Link href="/dashboard/clientes/nuevo">
          <Button className="gap-2"><Plus className="h-4 w-4" /> {t("clients", "addClient")}</Button>
        </Link>
      )}
    </div>
  );
}
