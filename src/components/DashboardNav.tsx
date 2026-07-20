"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dumbbell, Users, ClipboardList, Layers, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Trainer } from "@/types/database";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Inicio", icon: Dumbbell },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/rutinas", label: "Rutinas", icon: ClipboardList },
  { href: "/dashboard/ejercicios", label: "Ejercicios", icon: Layers },
];

export default function DashboardNav({ trainer }: { trainer: Trainer }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <Dumbbell className="h-5 w-5" />
            FitCoach
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/suscripcion">
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Suscripción
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                {trainer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{trainer.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
