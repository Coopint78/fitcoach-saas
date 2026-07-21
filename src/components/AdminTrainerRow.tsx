"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle } from "lucide-react";
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

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  if (status === "active") return <Badge className="bg-primary/15 text-primary border-primary/20 gap-1"><CheckCircle className="h-3 w-3" /> {t("admin", "statusActive")}</Badge>;
  if (status === "trialing") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 gap-1"><Clock className="h-3 w-3" /> {t("admin", "statusTrialing")}</Badge>;
  return <Badge className="bg-muted text-muted-foreground gap-1"><XCircle className="h-3 w-3" /> {status}</Badge>;
}

export default function AdminTrainerRow({ trainer }: { trainer: Trainer }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [status, setStatus] = useState(trainer.subscription_status ?? "inactive");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const STATUS_OPTIONS = [
    { value: "trialing", label: t("admin", "statusTrialing") },
    { value: "active", label: t("admin", "statusActive") },
    { value: "inactive", label: t("admin", "statusInactive") },
    { value: "canceled", label: t("admin", "statusCanceled") },
  ];

  const trialEnds = trainer.trial_ends_at ? new Date(trainer.trial_ends_at).toLocaleDateString() : null;
  const joinDate = new Date(trainer.created_at).toLocaleDateString();

  async function saveStatus(newStatus: string) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("trainers").update({ subscription_status: newStatus }).eq("id", trainer.id);
    if (error) {
      toast.error(t("admin", "errorUpdate"));
    } else {
      setStatus(newStatus);
      toast.success(t("admin", "statusUpdated"));
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{trainer.name}</p>
        <p className="text-xs text-muted-foreground truncate">{trainer.email}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{t("admin", "registeredOn").replace("{date}", joinDate)}</span>
          {trialEnds && <span>{t("admin", "trialUntil").replace("{date}", trialEnds)}</span>}
          {trainer.stripe_customer_id && <span className="text-primary">Stripe ✓</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { if (v !== null) setStatus(v); }}>
              <SelectTrigger className="h-8 rounded-lg text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={saving} onClick={() => saveStatus(status)} className="h-8 rounded-lg text-xs">
              {saving ? "..." : t("admin", "save")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setStatus(trainer.subscription_status ?? "inactive"); setEditing(false); }} className="h-8 rounded-lg text-xs">
              {t("admin", "cancel")}
            </Button>
          </div>
        ) : (
          <>
            <StatusBadge status={status} />
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="h-8 rounded-lg text-xs">
              {t("admin", "edit")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
