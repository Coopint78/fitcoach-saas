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
  description: "Gestiona clientes, crea rutinas y haz crecer tu negocio. 14 días de prueba gratis, sin tarjeta de crédito.",
  openGraph: {
    title: "FitCoach — Plataforma para entrenadores personales",
    description: "Gestiona clientes, crea rutinas y haz crecer tu negocio.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitCoach — Plataforma para entrenadores personales",
    description: "Gestiona clientes, crea rutinas y haz crecer tu negocio.",
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
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
