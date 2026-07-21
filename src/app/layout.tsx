import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitCoach — Plataforma para entrenadores personales",
  description: "Gestiona clientes, crea rutinas y haz crecer tu negocio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('fitcoach-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans min-h-full`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <Toaster richColors position="top-right" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
