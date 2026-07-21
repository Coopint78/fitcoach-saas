"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

export default function ProgressButton({
  clientId,
  exerciseId,
  isCompleted,
}: {
  clientId: string;
  exerciseId: string;
  isCompleted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function toggle() {
    setLoading(true);
    const supabase = createClient();

    if (isCompleted) {
      await supabase
        .from("progress_logs")
        .delete()
        .eq("client_id", clientId)
        .eq("exercise_id", exerciseId)
        .eq("completed", true)
        .gte("logged_at", new Date(Date.now() - 7 * 86400000).toISOString());
      toast.success(t("portal", "markedPending"));
    } else {
      await supabase.from("progress_logs").insert({ client_id: clientId, exercise_id: exerciseId, completed: true });
      toast.success(t("portal", "exerciseCompleted"));
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant={isCompleted ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`flex-shrink-0 gap-1 ${isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
    >
      {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {isCompleted ? t("portal", "done") : t("portal", "complete")}
    </Button>
  );
}
