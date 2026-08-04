"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Dumbbell, Users, ClipboardList, TrendingUp, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState(lang);

  useEffect(() => {
    setMounted(true);
    setCurrentLang(lang);
  }, [lang]);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "es" : "en";
    setCurrentLang(newLang);
    localStorage.setItem("fitcoach-home-lang", newLang);
    window.location.reload();
  };

  const features = [
    { icon: Users, title: t("landing", "f1Title"), desc: t("landing", "f1Desc") },
    { icon: ClipboardList, title: t("landing", "f2Title"), desc: t("landing", "f2Desc") },
    { icon: TrendingUp, title: t("landing", "f3Title"), desc: t("landing", "f3Desc") },
    { icon: Dumbbell, title: t("landing", "f4Title"), desc: t("landing", "f4Desc") },
  ];

  const pricingFeatures = [
    t("landing", "feat1"),
    t("landing", "feat2"),
    t("landing", "feat3"),
    t("landing", "feat4"),
    t("landing", "feat5"),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Dumbbell className="h-6 w-6" />
          FitCoach
        </div>
        <div className="flex gap-3 items-center">
          {mounted && (
            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={currentLang === "en" ? "Cambiar a Español" : "Switch to English"}
            >
              <Globe className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <Link href="/login">
            <Button variant="ghost">{t("landing", "signIn")}</Button>
          </Link>
          <Link href="/registro">
            <Button>{t("landing", "startFree")}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">
          {t("landing", "trialBadge")}
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {t("landing", "heroLine1")}<br />
          <span className="text-indigo-600">{t("landing", "heroHighlight")}</span> {t("landing", "heroLine2")}
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          {t("landing", "heroDesc")}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/registro">
            <Button size="lg" className="h-12 px-8 text-base">
              {t("landing", "startTrial")}
            </Button>
          </Link>
          <Link href="/precios">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              {t("landing", "viewPrices")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("landing", "featuresTitle")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <f.icon className="h-8 w-8 text-indigo-600 mb-2" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">{t("landing", "pricingTitle")}</h2>
        <p className="text-center text-gray-600 mb-12">{t("landing", "pricingSubtitle")}</p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Trial */}
          <Card className="border border-gray-200 shadow-sm hover:border-[#A3E635] hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-700">{t("landing", "planTrial")}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{t("landing", "trialDesc")}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
              </div>
              <p className="text-sm font-medium mt-1" style={{color:"#5a8a00"}}>{t("landing", "trialDays")}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitClients")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitClientsTrialVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitRoutines")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitRoutinesTrialVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitExercises")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitExercisesTrialVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitPortal")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitInvite")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitSupport")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitSupportTrialVal")}</span>
              </div>
              <div className="pt-3">
                <Link href="/registro" className="block">
                  <Button variant="outline" className="w-full" size="lg">{t("landing", "startTrialBtn")}</Button>
                </Link>
                <p className="text-center text-xs text-gray-400 mt-2">{t("landing", "noCreditCard")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Starter */}
          <Card className="border border-gray-200 shadow-sm hover:border-[#A3E635] hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-700">{t("landing", "planStarter")}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{t("landing", "starterDesc")}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-600">{t("landing", "perMonth")}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t("landing", "trialNote")}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitClients")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitClientsStarterVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitRoutines")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitRoutinesStarterVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitExercises")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitExercisesStarterVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitPortal")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitInvite")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitSupport")}</span>
                <span className="font-medium text-gray-800">{t("landing", "limitSupportStarterVal")}</span>
              </div>
              <div className="pt-3">
                <Link href="/registro" className="block">
                  <Button variant="outline" className="w-full" size="lg">{t("landing", "startTrialBtn")}</Button>
                </Link>
                <p className="text-center text-xs text-gray-400 mt-2">{t("landing", "noCreditCard")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-2 border-[#A3E635] shadow-lg relative overflow-visible hover:shadow-xl transition-all duration-200 cursor-pointer">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge style={{backgroundColor:"#A3E635", color:"#111827"}} className="px-4 font-bold ring-2 ring-white">{t("landing", "popular")}</Badge>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-[#111827]">{t("landing", "planPro")}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{t("landing", "proDesc")}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">{t("landing", "perMonth")}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t("landing", "trialNote")}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitClients")}</span>
                <span className="font-bold text-[#5a8a00]">{t("landing", "limitClientsProVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitRoutines")}</span>
                <span className="font-bold text-[#5a8a00]">{t("landing", "limitRoutinesProVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitExercises")}</span>
                <span className="font-bold text-[#5a8a00]">{t("landing", "limitExercisesProVal")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitPortal")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitInvite")}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t("landing", "limitSupport")}</span>
                <span className="font-bold text-[#5a8a00]">{t("landing", "limitSupportProVal")}</span>
              </div>
              <div className="pt-3">
                <Link href="/registro" className="block">
                  <Button className="w-full bg-[#A3E635] hover:bg-[#bef264] text-[#111827] font-bold" size="lg">{t("landing", "startTrialBtn")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500 space-y-2">
        <p>{t("landing", "footer")}</p>
        <p className="flex items-center justify-center gap-4">
          <Link href="/terminos" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            {lang === "en" ? "Terms and Conditions" : "Términos y Condiciones"}
          </Link>
          <span>·</span>
          <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            {lang === "en" ? "Privacy Policy" : "Política de Privacidad"}
          </Link>
        </p>
      </footer>
    </div>
  );
}
