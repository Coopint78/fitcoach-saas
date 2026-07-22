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

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(`${error.message}`);
    } else {
      const role = data.user?.user_metadata?.role;
      router.push(role === "client" ? "/portal" : "/dashboard");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4">
      {/* Top bar */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#A3E635] mb-2">
            <Zap className="h-7 w-7 text-[#111827]" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white">FitCoach</h1>
          <p className="text-sm text-gray-400">{t("auth", "loginDesc")}</p>
        </div>

        {/* Form card */}
        <div className="bg-[#1A2035] rounded-2xl border border-white/5 p-6 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300 text-sm">{t("auth", "email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635] focus:ring-[#A3E635]/20"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300 text-sm">{t("auth", "password")}</Label>
                <Link href="/forgot-password" className="text-xs text-[#A3E635] hover:underline">
                  {t("auth", "forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635] focus:ring-[#A3E635]/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold text-sm mt-2"
              disabled={loading}
            >
              {loading ? t("auth", "loggingIn") : t("auth", "loginBtn")}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            {t("auth", "noAccount")}{" "}
            <Link href="/registro" className="text-[#A3E635] hover:underline font-medium">
              {t("auth", "register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
