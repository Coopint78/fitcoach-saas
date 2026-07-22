"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
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
          <h1 className="text-2xl font-bold text-white">{t("auth", "forgotPasswordTitle")}</h1>
          <p className="text-sm text-gray-400">{t("auth", "forgotPasswordDesc")}</p>
        </div>

        <div className="bg-[#1A2035] rounded-2xl border border-white/5 p-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#A3E635]/10 mx-auto">
                <CheckCircle className="h-7 w-7 text-[#A3E635]" />
              </div>
              <div>
                <p className="font-semibold text-white">{t("auth", "checkEmail")}</p>
                <p className="text-sm text-gray-400 mt-1">{t("auth", "checkEmailDesc")} <strong className="text-white">{email}</strong></p>
              </div>
              <Link href="/login">
                <Button className="w-full h-11 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold">
                  {t("auth", "backToLogin")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-300 text-sm">{t("auth", "email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold"
                disabled={loading}
              >
                {loading ? t("auth", "sending") : t("auth", "sendRecovery")}
              </Button>
              <Link href="/login">
                <Button type="button" variant="ghost" className="w-full gap-2 text-gray-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth", "backToLogin")}
                </Button>
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
