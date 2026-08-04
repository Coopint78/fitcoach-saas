"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage } from "@/lib/i18n/context";

export default function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrerUsername, setReferrerUsername] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferrerUsername(ref);
      setReferrerName(ref);
    }
  }, [searchParams]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(t("auth", "passwordTooShort"));
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, referrerUsername }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Error al registrarse");
    } else {
      toast.success(t("auth", "confirmEmailMsg"));
      router.push("/verificar-email");
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

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-bold">
              ← {t("common", "cancel")}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {t("auth", "createAccount")}
          </h1>
          <p className="text-gray-400 mb-6">
            {referrerName
              ? `Registrado por invitación de ${referrerName}`
              : t("auth", "loginDesc")}
          </p>

          {referrerName && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-6 text-sm text-indigo-400">
              ✨ Te registras con el entrenador <strong>{referrerName}</strong>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white text-sm font-medium">
                {t("auth", "fullName")}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t("auth", "namePlaceholder")}
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white text-sm font-medium">
                {t("auth", "email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth", "emailPlaceholder")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white text-sm font-medium">
                {t("auth", "password")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth", "passwordMin")}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500 mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2"
            >
              {loading ? t("common", "saving") : t("auth", "createAccount")}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t("auth", "haveAccount")}{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-bold">
              {t("auth", "login")}
            </Link>
          </p>
        </div>

        {/* Right side - Benefits */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              {t("auth", "perk2")}
            </h2>
            {perks.map((perk, i) => (
              <div key={i} className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">{perk}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-600/10 border border-indigo-600/30 rounded-lg p-4 mt-8">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <p className="text-sm text-indigo-300">
                <strong>Acceso inmediato:</strong> Comienza tu prueba de 14 días ahora mismo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
