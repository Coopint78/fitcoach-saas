import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Dumbbell, Users, ClipboardList, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Dumbbell className="h-6 w-6" />
          FitCoach
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
          <Link href="/registro">
            <Button>Comenzar gratis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200">
          14 días de prueba gratuita
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Tu plataforma para<br />
          <span className="text-indigo-600">entrenar mejor</span> a tus clientes
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Crea rutinas personalizadas, gestiona tus clientes y entrega programas
          profesionales desde un solo lugar. Sin planillas de Excel.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/registro">
            <Button size="lg" className="h-12 px-8 text-base">
              Empezar prueba gratuita
            </Button>
          </Link>
          <Link href="/precios">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Ver precios
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Todo lo que necesitás para tu negocio
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Gestión de clientes", desc: "Registra objetivos, notas y seguimiento por cliente." },
              { icon: ClipboardList, title: "Creador de rutinas", desc: "Arma ejercicios con series, reps y videos en minutos." },
              { icon: TrendingUp, title: "Seguimiento de progreso", desc: "Tus clientes marcan ejercicios completados y registran peso." },
              { icon: Dumbbell, title: "Portal del cliente", desc: "Cada cliente ve su rutina semanal desde su propio acceso." },
            ].map((f) => (
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
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Precio simple</h2>
        <p className="text-center text-gray-600 mb-12">Sin sorpresas. Cancelá cuando quieras.</p>
        <div className="max-w-sm mx-auto">
          <Card className="border-2 border-indigo-600 shadow-lg">
            <CardHeader className="text-center pb-4">
              <Badge className="w-fit mx-auto mb-2 bg-indigo-600">Más popular</Badge>
              <CardTitle className="text-2xl">FitCoach Pro</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">14 días gratis, sin tarjeta al inicio</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Clientes ilimitados",
                "Ejercicios y rutinas ilimitados",
                "Portal del cliente incluido",
                "Seguimiento de progreso",
                "Soporte por email",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
              <div className="pt-4">
                <Link href="/registro" className="block">
                  <Button className="w-full" size="lg">Comenzar prueba gratis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>© 2025 FitCoach. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
