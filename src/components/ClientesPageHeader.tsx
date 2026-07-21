"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function ClientesPageHeader({ count }: { count: number }) {
  const { t } = useLanguage();
  const label = count === 1 ? t("clients", "count_one") : t("clients", "count_other");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("clients", "title")}</h1>
        <p className="text-gray-600 text-sm">{count} {label}</p>
      </div>
      <Link href="/dashboard/clientes/nuevo">
        <Button className="gap-2"><Plus className="h-4 w-4" /> {t("clients", "addClient")}</Button>
      </Link>
    </div>
  );
}
