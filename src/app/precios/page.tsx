"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function PreciosPage() {
  const { t, lang } = useLanguage();

  const starterFeatures = lang === "es"
    ? ["Hasta 10 clientes", "Ejercicios y rutinas ilimitadas", "Portal del cliente incluido", "Seguimiento de progreso", "Soporte por email"]
    : ["Up to 10 clients", "Unlimited exercises & routines", "Client portal included", "Progress tracking", "Email support"];

  const proFeatures = lang === "es"
    ? ["Clientes ilimitados", "Ejercicios y rutinas ilimitadas", "Portal del cliente incluido", "Seguimiento de progreso", "Soporte prioritario"]
    : ["Unlimited clients", "Unlimited exercises & routines", "Client portal included", "Progress tracking", "Priority support"];

  return (
    <div className="min-h-screen bg-[#0F1117] text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-7 w-7 rounded-lg bg-[#A3E635] flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#111827]" fill="currentColor" />
            </div>
            FitCoach
          </Link>
          <div className="flex gap-3">
            <Link href="/login"><Button variant="ghost" className="text-gray-400 hover:text-white">{t("pricing", "signIn")}</Button></Link>
            <Link href="/registro">
              <Button className="bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold rounded-xl">{t("pricing", "startFree")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("pricing", "backToHome")}
        </Link>
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#A3E635] uppercase tracking-widest mb-3">{t("pricing", "pricingLabel")}</p>
          <h1 className="text-4xl font-bold mb-4">{t("pricing", "title")}</h1>
          <p className="text-gray-400">{t("pricing", "subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Starter */}
          <div className="bg-[#1A2035] rounded-3xl border border-white/10 p-8 relative overflow-hidden">
            <div className="relative">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Starter</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-gray-400 mb-2">{t("pricing", "perMonth")}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{t("pricing", "trialNote")}</p>
              <div className="space-y-3 mb-8">
                {starterFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/registro" className="block">
                <Button variant="outline" className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-base">
                  {t("pricing", "startBtn")}
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">{t("pricing", "noCard")}</p>
            </div>
          </div>

          {/* Pro */}
          <div className="bg-[#1A2035] rounded-3xl border border-[#A3E635]/30 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#A3E635]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <p className="text-sm font-semibold text-[#A3E635] uppercase tracking-widest mb-2">{t("pricing", "planLabel")}</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-gray-400 mb-2">{t("pricing", "perMonth")}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{t("pricing", "trialNote")}</p>
              <div className="space-y-3 mb-8">
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#A3E635]/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3.5 w-3.5 text-[#A3E635]" />
                    </div>
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/registro" className="block">
                <Button className="w-full h-12 rounded-xl bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold text-base">
                  {t("pricing", "startBtn")}
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">{t("pricing", "noCard")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
