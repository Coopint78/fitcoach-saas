"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

export default function NuevaRutinaPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
    if (!user) { router.push("/login"); return; }
    const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
    if (!trainer) { setLoading(false); return; }

    const { data: routine, error } = await supabase
      .from("routines")
      .insert({ trainer_id: trainer.id, name })
      .select()
      .single();

    if (error) {
      toast.error(t("routines", "errorCreate"));
    } else {
      toast.success(t("routines", "routineCreated"));
      router.push(`/dashboard/rutinas/${routine.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/rutinas">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t("routines", "newRoutine")}</h1>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{t("routines", "nameLabel")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("routines", "nameRequired")}</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder={t("routines", "namePlaceholder")} autoFocus />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t("routines", "creating") : t("routines", "createAndAdd")}
              </Button>
              <Link href="/dashboard/rutinas">
                <Button type="button" variant="outline">{t("routines", "cancel")}</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
