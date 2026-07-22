import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones — FitCoach",
  description: "Términos y condiciones del servicio FitCoach.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Volver al inicio</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Términos y Condiciones</h1>
        <p className="text-muted-foreground text-sm mb-10">Última actualización: julio de 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Aceptación de los términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar FitCoach (&quot;la Plataforma&quot;), usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar la Plataforma. FitCoach se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios mediante la actualización de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Descripción del servicio</h2>
            <p className="text-muted-foreground">
              FitCoach es una plataforma de software (SaaS) que permite a entrenadores personales gestionar sus clientes, crear rutinas de ejercicio, hacer seguimiento del progreso y administrar pagos. FitCoach actúa exclusivamente como proveedor de tecnología y herramientas de gestión, y no como empleador, socio ni representante de ningún entrenador que utilice la plataforma.
            </p>
          </section>

          <section className="bg-destructive/5 border border-destructive/20 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">3. Limitación de responsabilidad — Entrenadores y servicios de entrenamiento</h2>
            <p className="text-muted-foreground mb-3">
              <strong className="text-foreground">FitCoach no es responsable, bajo ningún concepto ni circunstancia</strong>, por los servicios de entrenamiento personal ofrecidos por los entrenadores registrados en la Plataforma. Esto incluye, pero no se limita a:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>Lesiones físicas, daños a la salud o consecuencias médicas derivadas de rutinas o instrucciones proporcionadas por entrenadores.</li>
              <li>La calidad, idoneidad, precisión o resultados de los planes de entrenamiento.</li>
              <li>La habilitación profesional, titulación o certificación de los entrenadores.</li>
              <li>Conflictos, disputas o incumplimientos entre entrenadores y sus clientes.</li>
              <li>Pérdidas económicas resultantes de la relación entre el entrenador y el cliente.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Los entrenadores son profesionales independientes que utilizan FitCoach como herramienta. Toda relación contractual por servicios de entrenamiento es exclusivamente entre el entrenador y su cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Registro y cuentas</h2>
            <p className="text-muted-foreground">
              Para utilizar la Plataforma, los entrenadores deben registrarse con información veraz y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas desde su cuenta. FitCoach se reserva el derecho de suspender o eliminar cuentas que violen estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Suscripción y pagos</h2>
            <p className="text-muted-foreground mb-3">
              FitCoach ofrece un período de prueba gratuito de 14 días. Finalizado el período de prueba, el acceso completo requiere una suscripción mensual de $29 USD. Los pagos se procesan a través de Stripe y se renuevan automáticamente cada mes.
            </p>
            <p className="text-muted-foreground">
              FitCoach retiene una comisión del 5% sobre los pagos de coaching procesados a través de la plataforma entre entrenadores y sus clientes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Cancelación</h2>
            <p className="text-muted-foreground">
              Los entrenadores pueden cancelar su suscripción en cualquier momento desde la sección <strong className="text-foreground">Suscripción</strong> de su cuenta. La cancelación es efectiva al final del período de facturación en curso, sin cargos adicionales. No se realizan reembolsos proporcionales por períodos no utilizados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Propiedad intelectual</h2>
            <p className="text-muted-foreground">
              El software, diseño, marca y contenido de FitCoach son propiedad exclusiva de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción, distribución o uso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Privacidad</h2>
            <p className="text-muted-foreground">
              FitCoach recopila y procesa datos personales necesarios para el funcionamiento del servicio, incluyendo nombre, correo electrónico e información de pago. Los datos son almacenados de forma segura y no son vendidos ni compartidos con terceros salvo los proveedores necesarios para operar el servicio (Supabase, Stripe). El usuario tiene derecho a solicitar el acceso, rectificación o eliminación de sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Conducta del usuario</h2>
            <p className="text-muted-foreground">
              Queda prohibido utilizar la Plataforma para actividades ilegales, engañosas o que perjudiquen a terceros. FitCoach puede suspender el acceso a cualquier usuario que infrinja estas normas sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Jurisdicción y ley aplicable</h2>
            <p className="text-muted-foreground">
              Estos términos se rigen por las leyes aplicables en la jurisdicción donde opera FitCoach. Cualquier disputa será resuelta mediante negociación de buena fe y, de no llegarse a un acuerdo, por los tribunales competentes correspondientes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Contacto</h2>
            <p className="text-muted-foreground">
              Para consultas sobre estos términos, puede contactarnos en: <a href="mailto:info@ledorvador.us" className="text-primary hover:underline">info@ledorvador.us</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FitCoach. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
