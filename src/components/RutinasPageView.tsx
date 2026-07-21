"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ClipboardList, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Routine = {
  id: string;
  name: string;
  routine_items: { count: number }[];
};

export default function RutinasPageView({ routines }: { routines: Routine[] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">{t("routines", "library")}</p>
          <h1 className="text-2xl font-bold">{t("routines", "title")}</h1>
        </div>
        <Link href="/dashboard/rutinas/nueva">
          <Button className="gap-2 h-10 rounded-xl font-semibold"><Plus className="h-4 w-4" /> {t("routines", "newRoutine")}</Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">{t("routines", "noRoutines")}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t("routines", "noRoutinesDesc")}</p>
          <Link href="/dashboard/rutinas/nueva">
            <Button className="rounded-xl font-semibold gap-2"><Plus className="h-4 w-4" /> {t("routines", "createFirst")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {routines.map((r) => {
            const exCount = r.routine_items?.[0]?.count ?? 0;
            return (
              <Link key={r.id} href={`/dashboard/rutinas/${r.id}`}>
                <Card className="rounded-2xl border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{exCount} {t("routines", "exercises")}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
