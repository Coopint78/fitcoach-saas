"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/lib/i18n/context";

export default function RegistroPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("auth", "passwordTooShort"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "trainer" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("auth", "confirmEmailMsg"));
      router.push("/login");
    }
    setLoading(false);
  }

  const perks = [
    t("auth", "perk1"),
    t("auth", "perk2"),
    t("auth", "perk3"),
  ];

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#A3E635] mb-2">
            <Zap className="h-7 w-7 text-[#111827]" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t("auth", "createAccount")}</h1>
          <div className="flex flex-col gap-1 pt-1">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-[#A3E635] shrink-0" />
                <span className="text-xs text-gray-400">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A2035] rounded-2xl border border-white/5 p-6 space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-300 text-sm">{t("auth", "fullName")}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder={t("auth", "namePlaceholder")}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300 text-sm">{t("auth", "email")}</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t("auth", "emailPlaceholder")}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300 text-sm">{t("auth", "password")}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder={t("auth", "passwordMin")}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3E635]" />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold" disabled={loading}>
              {loading ? t("auth", "creating") : t("auth", "startFree")}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500">
            {t("auth", "haveAccount")}{" "}
            <Link href="/login" className="text-[#A3E635] hover:underline font-medium">{t("auth", "login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
