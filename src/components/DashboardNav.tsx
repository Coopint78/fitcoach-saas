"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, Users, ClipboardList, Layers, LogOut, CreditCard, Menu, X, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Trainer } from "@/types/database";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function DashboardNav({ trainer }: { trainer: Trainer }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: t("nav", "home"), icon: Zap },
    { href: "/dashboard/clientes", label: t("nav", "clients"), icon: Users },
    { href: "/dashboard/rutinas", label: t("nav", "routines"), icon: ClipboardList },
    { href: "/dashboard/ejercicios", label: t("nav", "exercises"), icon: Layers },
    { href: "/dashboard/connect", label: t("nav", "payments"), icon: Banknote },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav className="bg-[#111827] border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="h-7 w-7 rounded-lg bg-[#A3E635] flex items-center justify-center">
            <Zap className="h-4 w-4 text-[#111827]" fill="currentColor" />
          </div>
          <span className="text-white">FitCoach</span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive(link.href)
                  ? "bg-[#A3E635] text-[#111827]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <LanguageToggle />
          <Link href="/dashboard/suscripcion" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-8">
              <CreditCard className="h-3.5 w-3.5" />
              {t("nav", "subscription")}
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10 ml-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-[#A3E635] text-[#111827] text-xs font-bold">
                {trainer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-300 max-w-[120px] truncate">{trainer.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-9 h-9 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            title={t("nav", "logout")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden w-9 h-9 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#111827] border-t border-white/5 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                isActive(link.href)
                  ? "bg-[#A3E635] text-[#111827]"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard/suscripcion"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10"
          >
            <CreditCard className="h-4 w-4" />
            {t("nav", "subscription")}
          </Link>
        </div>
      )}
    </nav>
  );
}
