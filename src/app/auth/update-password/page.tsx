"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

export default function UpdatePasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t("auth", "passwordMismatch"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("auth", "passwordUpdated"));
      router.push("/login");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#A3E635] mb-2">
            <Zap className="h-7 w-7 text-[#111827]" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t("auth", "updatePassword")}</h1>
          <p className="text-sm text-gray-400">{t("auth", "updatePasswordDesc")}</p>
        </div>

        <div className="bg-[#1A2035] rounded-2xl border border-white/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300 text-sm">{t("auth", "newPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-gray-300 text-sm">{t("auth", "confirmPassword")}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold mt-2"
              disabled={loading}
            >
              {loading ? t("auth", "updating") : t("auth", "updateBtn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
