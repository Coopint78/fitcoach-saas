import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitCoach — Plataforma para entrenadores personales",
  description: "Gestiona clientes, crea rutinas y haz crecer tu negocio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
