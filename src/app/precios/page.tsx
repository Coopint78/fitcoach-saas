import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Dumbbell, ArrowLeft } from "lucide-react";

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Dumbbell className="h-6 w-6" /> FitCoach
        </Link>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost">Iniciar sesión</Button></Link>
          <Link href="/registro"><Button>Empezar gratis</Button></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Precio simple y transparente</h1>
          <p className="text-lg text-gray-600">Sin costos ocultos. Cancelá cuando quieras.</p>
        </div>

        <Card className="border-2 border-indigo-600 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">FitCoach Pro</CardTitle>
            <div className="mt-4">
              <span className="text-6xl font-bold">$29</span>
              <span className="text-gray-600 text-lg">/mes</span>
            </div>
            <p className="text-indigo-600 font-medium mt-2">14 días de prueba gratis — sin tarjeta al inicio</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Clientes ilimitados",
              "Ejercicios y rutinas ilimitadas",
              "Portal del cliente incluido",
              "Seguimiento de progreso semanal",
              "Invitación de clientes por email",
              "Soporte por email",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
            <div className="pt-6">
              <Link href="/registro" className="block">
                <Button className="w-full" size="lg">Empezar prueba gratis</Button>
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">
                No se requiere tarjeta de crédito para la prueba
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
