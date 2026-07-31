"use client";
import { useLanguage } from "@/lib/i18n/context";

function Step({ num, es, en }: { num: number; es: React.ReactNode; en: React.ReactNode }) {
  const { lang } = useLanguage();
  return (
    <div className="flex gap-3 items-start bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl px-4 py-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#A3E635] text-[#111827] font-bold text-xs flex items-center justify-center mt-0.5">{num}</div>
      <p className="text-sm">{lang === "es" ? es : en}</p>
    </div>
  );
}

function Section({ id, icon, titleEs, titleEn, subtitleEs, subtitleEn, children }: {
  id: string; icon: string; titleEs: string; titleEn: string; subtitleEs: string; subtitleEn: string; children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  return (
    <div id={id} className="bg-card border border-border rounded-2xl p-6 scroll-mt-20">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-xl font-bold">{lang === "es" ? titleEs : titleEn}</h2>
          <p className="text-sm text-muted-foreground">{lang === "es" ? subtitleEs : subtitleEn}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Tip({ es, en }: { es: string; en: string }) {
  const { lang } = useLanguage();
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300 mt-3">
      💡 {lang === "es" ? es : en}
    </div>
  );
}

function Info({ es, en }: { es: string; en: string }) {
  const { lang } = useLanguage();
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-800 dark:text-blue-300 mt-3">
      {lang === "es" ? es : en}
    </div>
  );
}

function Warn({ es, en }: { es: string; en: string }) {
  const { lang } = useLanguage();
  return (
    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 text-sm text-orange-800 dark:text-orange-300 mt-3">
      ⚠️ {lang === "es" ? es : en}
    </div>
  );
}

function SubHeading({ es, en }: { es: string; en: string }) {
  const { lang } = useLanguage();
  return <h3 className="font-semibold text-base mt-5 mb-3">{lang === "es" ? es : en}</h3>;
}

function FieldsTable({ rows }: { rows: { fieldEs: string; fieldEn: string; required: boolean; descEs: string; descEn: string }[] }) {
  const { lang } = useLanguage();
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            <th className="text-left px-3 py-2 rounded-tl-lg">{lang === "es" ? "Campo" : "Field"}</th>
            <th className="text-left px-3 py-2">{lang === "es" ? "Tipo" : "Type"}</th>
            <th className="text-left px-3 py-2 rounded-tr-lg">{lang === "es" ? "Descripción" : "Description"}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-medium">{lang === "es" ? r.fieldEs : r.fieldEn}</td>
              <td className="px-3 py-2">
                {r.required
                  ? <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold px-2 py-0.5 rounded-full">{lang === "es" ? "Requerido" : "Required"}</span>
                  : <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">{lang === "es" ? "Opcional" : "Optional"}</span>
                }
              </td>
              <td className="px-3 py-2 text-muted-foreground">{lang === "es" ? r.descEs : r.descEn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GuiaPage() {
  const { lang } = useLanguage();

  const index = [
    { id: "dashboard", icon: "🏠", es: "Dashboard", en: "Dashboard" },
    { id: "clientes", icon: "👥", es: "Clientes", en: "Clients" },
    { id: "sesiones", icon: "📅", es: "Sesiones y Disponibilidad", en: "Sessions & Availability" },
    { id: "ejercicios", icon: "💪", es: "Ejercicios", en: "Exercises" },
    { id: "rutinas", icon: "📋", es: "Rutinas", en: "Routines" },
    { id: "cobros", icon: "💳", es: "Cobros (Stripe)", en: "Payments (Stripe)" },
    { id: "perfil", icon: "🌐", es: "Perfil Público", en: "Public Profile" },
    { id: "suscripcion", icon: "⚡", es: "Suscripción", en: "Subscription" },
  ];

  const clientFields = [
    { fieldEs: "Nombre completo", fieldEn: "Full name", required: true, descEs: "Nombre y apellido del cliente", descEn: "Client's first and last name" },
    { fieldEs: "Email", fieldEn: "Email", required: true, descEs: "Se usa para enviar la invitación al portal", descEn: "Used to send the portal invitation" },
    { fieldEs: "Teléfono", fieldEn: "Phone", required: false, descEs: "Número de contacto", descEn: "Contact number" },
    { fieldEs: "Fecha de nacimiento", fieldEn: "Date of birth", required: false, descEs: "Para calcular la edad", descEn: "To calculate age" },
    { fieldEs: "Género", fieldEn: "Gender", required: false, descEs: "Masculino / Femenino / Otro", descEn: "Male / Female / Other" },
    { fieldEs: "Altura (cm)", fieldEn: "Height (cm)", required: false, descEs: "En centímetros", descEn: "In centimeters" },
    { fieldEs: "Peso (kg)", fieldEn: "Weight (kg)", required: false, descEs: "En kilogramos", descEn: "In kilograms" },
    { fieldEs: "Dirección", fieldEn: "Address", required: false, descEs: "Domicilio del cliente", descEn: "Client's address" },
    { fieldEs: "Objetivo", fieldEn: "Goal", required: false, descEs: "Meta de entrenamiento", descEn: "Training goal" },
    { fieldEs: "Notas internas", fieldEn: "Internal notes", required: false, descEs: "Lesiones, historial. Solo visible al entrenador.", descEn: "Injuries, history. Only visible to the trainer." },
  ];

  const planRows = [
    { plan: "Trial", price: "$0", clientsEs: "Hasta 5", clientsEn: "Up to 5", featEs: "Ejercicios y rutinas ilimitadas, portal del cliente, seguimiento de progreso. Válido 14 días.", featEn: "Unlimited exercises and routines, client portal, progress tracking. Valid 14 days." },
    { plan: "Starter", price: "$19/mo", clientsEs: "Hasta 10", clientsEn: "Up to 10", featEs: "Todo lo del Trial + soporte por email.", featEn: "Everything in Trial + email support." },
    { plan: "Pro", price: "$29/mo", clientsEs: "Ilimitados", clientsEn: "Unlimited", featEs: "Todo lo del Starter + clientes ilimitados + soporte prioritario.", featEn: "Everything in Starter + unlimited clients + priority support." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-extrabold mb-2">
          {lang === "es" ? "Guía de la Plataforma" : "Platform Guide"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "es"
            ? "Todo lo que necesitás saber para sacarle el máximo provecho a FitCoach."
            : "Everything you need to know to get the most out of FitCoach."}
        </p>
      </div>

      {/* INDEX */}
      <div className="bg-card border border-border rounded-2xl px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {lang === "es" ? "Contenido" : "Contents"}
        </p>
        <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5 list-decimal list-inside text-sm">
          {index.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-[#6abf2e] hover:underline font-medium">
                {item.icon} {lang === "es" ? item.es : item.en}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* 1. DASHBOARD */}
      <Section id="dashboard" icon="🏠" titleEs="Dashboard" titleEn="Dashboard" subtitleEs="Tu vista general de la plataforma" subtitleEn="Your platform overview">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "Al ingresar verás el Dashboard: un resumen rápido de tu actividad y accesos directos a las funciones más usadas."
            : "When you log in you'll see the Dashboard: a quick summary of your activity and shortcuts to the most used features."}
        </p>
        <div className="space-y-2">
          <Step num={1} es={<><strong>Tarjetas de resumen:</strong> Cantidad de clientes, rutinas y ejercicios. Hacé clic en cualquiera para ir a esa sección.</>} en={<><strong>Summary cards:</strong> Number of clients, routines and exercises. Click any card to go directly to that section.</>} />
          <Step num={2} es={<><strong>Acciones rápidas:</strong> Accesos directos para agregar clientes, crear rutinas o ejercicios sin navegar el menú.</>} en={<><strong>Quick actions:</strong> Shortcuts to add clients, create routines or exercises without navigating the menu.</>} />
        </div>
      </Section>

      {/* 2. CLIENTS */}
      <Section id="clientes" icon="👥" titleEs="Clientes" titleEn="Clients" subtitleEs="Gestioná tu lista de clientes" subtitleEn="Manage your client list">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "En Clientes podés ver todos tus clientes, agregar nuevos y acceder a su perfil individual."
            : "In Clients you can see all your clients, add new ones, and access their individual profile."}
        </p>
        <SubHeading es="Cómo agregar un nuevo cliente" en="How to add a new client" />
        <div className="space-y-2">
          <Step num={1} es={<>Hacé clic en <strong>"+ Agregar cliente"</strong> en la esquina superior derecha.</>} en={<>Click <strong>"+ Add client"</strong> in the top right corner.</>} />
          <Step num={2} es="Completá el formulario con los datos del cliente (ver tabla abajo)." en="Fill in the client form (see table below)." />
          <Step num={3} es={<>Hacé clic en <strong>"Crear y enviar invitación"</strong>. El cliente recibe un email para acceder a su portal personal.</>} en={<>Click <strong>"Create and send invitation"</strong>. The client receives an email to access their personal portal.</>} />
        </div>
        <SubHeading es="Campos del formulario" en="Form fields" />
        <FieldsTable rows={clientFields} />
        <Info es="📧 Al crear el cliente, la plataforma le envía automáticamente un email de invitación para acceder a su portal donde verá sus rutinas, progreso y sesiones." en="📧 When you create a client, the platform automatically sends an invitation email to access their portal where they'll see their routines, progress, and sessions." />
      </Section>

      {/* 3. SESSIONS */}
      <Section id="sesiones" icon="📅" titleEs="Sesiones y Disponibilidad" titleEn="Sessions & Availability" subtitleEs="Organizá tu agenda" subtitleEn="Organize your schedule">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "La sección Sesiones tiene tres partes: el calendario semanal, las excepciones de disponibilidad y la configuración de horarios."
            : "The Sessions section has three parts: the weekly calendar, availability exceptions, and your schedule configuration."}
        </p>
        <SubHeading es="Configurar horarios disponibles" en="Setting up available hours" />
        <div className="space-y-2">
          <Step num={1} es={<>Scrolleá hacia abajo en Sesiones hasta la sección <strong>"Disponibilidad"</strong>.</>} en={<>Scroll down on the Sessions page to the <strong>"Availability"</strong> section.</>} />
          <Step num={2} es={<>Configurá la <strong>duración estándar</strong> de tus sesiones (por defecto 60 minutos).</>} en={<>Set the <strong>standard duration</strong> of your sessions (default 60 minutes).</>} />
          <Step num={3} es={<>En <strong>"Horarios disponibles"</strong>, hacé clic en <strong>"+ Agregar horario"</strong> en cada día para indicar cuándo estás disponible.</>} en={<>Under <strong>"Available hours"</strong>, click <strong>"+ Add time"</strong> on each day to set when you're available.</>} />
        </div>
        <SubHeading es="Excepciones de disponibilidad — días bloqueados" en="Availability exceptions — blocked days" />
        <p className="text-sm text-muted-foreground mb-3">
          {lang === "es"
            ? "Sirven para bloquear fechas específicas en las que no estás disponible aunque normalmente trabajés ese día. Útil para feriados, vacaciones o compromisos personales."
            : "Used to block specific dates when you're not available even if it's normally a working day. Useful for holidays, vacations, or personal commitments."}
        </p>
        <div className="space-y-2">
          <Step num={1} es={<>Hacé clic en <strong>"Excepciones de disponibilidad"</strong> para expandir la sección.</>} en={<>Click <strong>"Availability exceptions"</strong> to expand the section.</>} />
          <Step num={2} es={<>Hacé clic en <strong>"+ Agregar excepción"</strong>.</>} en={<>Click <strong>"+ Add exception"</strong>.</>} />
          <Step num={3} es={<>Seleccioná la fecha. Marcá <strong>"Todo el día"</strong> para bloquear el día completo, o elegí un rango de horas específico.</>} en={<>Select the date. Check <strong>"All day"</strong> to block the entire day, or choose a specific time range.</>} />
          <Step num={4} es="Agregá una razón opcional (vacaciones, feriado, etc.) y guardá." en="Add an optional reason (vacation, holiday, etc.) and save." />
        </div>
      </Section>

      {/* 4. EXERCISES */}
      <Section id="ejercicios" icon="💪" titleEs="Ejercicios" titleEn="Exercises" subtitleEs="Tu biblioteca de ejercicios" subtitleEn="Your exercise library">
        <Warn es="Importante: Los ejercicios se deben cargar antes de crear las rutinas. Una rutina está compuesta por ejercicios de tu biblioteca — cargá los ejercicios primero." en="Important: Exercises must be loaded before creating routines. A routine is made up of exercises from your library — load exercises first." />
        <SubHeading es="Cómo crear un ejercicio" en="How to create an exercise" />
        <div className="space-y-2">
          <Step num={1} es={<>Hacé clic en <strong>"+ Nuevo ejercicio"</strong>.</>} en={<>Click <strong>"+ New exercise"</strong>.</>} />
          <Step num={2} es={<>Ingresá el <strong>nombre</strong> del ejercicio (obligatorio).</>} en={<>Enter the exercise <strong>name</strong> (required).</>} />
          <Step num={3} es={<>Agregá una <strong>descripción</strong> opcional explicando cómo se realiza.</>} en={<>Add an optional <strong>description</strong> explaining how to perform it.</>} />
          <Step num={4} es={<>Pegá una <strong>URL de YouTube</strong> o subí un archivo de video desde tu computadora.</>} en={<>Paste a <strong>YouTube URL</strong> or upload a video file from your computer.</>} />
          <Step num={5} es={<>Hacé clic en <strong>"Crear ejercicio"</strong>. Ya estará disponible para usar en rutinas.</>} en={<>Click <strong>"Create exercise"</strong>. It will now be available to use in routines.</>} />
        </div>
      </Section>

      {/* 5. ROUTINES */}
      <Section id="rutinas" icon="📋" titleEs="Rutinas" titleEn="Routines" subtitleEs="Creá y asigná rutinas a tus clientes" subtitleEn="Create and assign routines to your clients">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "Las rutinas agrupan ejercicios en un plan de entrenamiento. Una vez creadas, las asignás a uno o más clientes. Primero cargá los ejercicios (sección anterior)."
            : "Routines group exercises into a training plan. Once created, assign them to one or more clients. Load exercises first (previous section)."}
        </p>
        <SubHeading es="Cómo crear una rutina" en="How to create a routine" />
        <div className="space-y-2">
          <Step num={1} es="Asegurate de tener ejercicios cargados en tu biblioteca." en="Make sure you have exercises loaded in your library." />
          <Step num={2} es={<>Hacé clic en <strong>"+ Nueva rutina"</strong> e ingresá el nombre.</>} en={<>Click <strong>"+ New routine"</strong> and enter the name.</>} />
          <Step num={3} es={<>Hacé clic en <strong>"Crear y agregar ejercicios"</strong>. Se abrirá el editor de rutina.</>} en={<>Click <strong>"Create and add exercises"</strong>. The routine editor will open.</>} />
          <Step num={4} es={<>Hacé clic en <strong>"+ Agregar"</strong> para añadir ejercicios desde tu biblioteca. Configurá series y repeticiones para cada uno.</>} en={<>Click <strong>"+ Add"</strong> to add exercises from your library. Set sets and reps for each one.</>} />
          <Step num={5} es="Podés reordenar los ejercicios arrastrándolos. La rutina se guarda automáticamente." en="You can reorder exercises by dragging them. The routine saves automatically." />
        </div>
        <Tip es="Podés duplicar una rutina existente con el ícono de copiar para usarla como base para otra similar." en="You can duplicate an existing routine using the copy icon to use it as a base for a similar one." />
      </Section>

      {/* 6. PAYMENTS */}
      <Section id="cobros" icon="💳" titleEs="Cobros con Stripe" titleEn="Payments with Stripe" subtitleEs="Cobrá a tus clientes de forma online" subtitleEn="Charge your clients online">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "FitCoach usa Stripe para procesar los pagos — una plataforma de pagos segura y reconocida mundialmente. Para cobrar a tus clientes necesitás conectar tu cuenta de Stripe."
            : "FitCoach uses Stripe to process payments — a secure, globally recognized payment platform. To charge your clients you need to connect your Stripe account."}
        </p>
        <SubHeading es="Cómo configurar Stripe" en="How to set up Stripe" />
        <div className="space-y-2">
          <Step num={1} es={<>Hacé clic en <strong>"Conectar con Stripe"</strong>. Serás redirigido a Stripe para crear o vincular tu cuenta.</>} en={<>Click <strong>"Connect with Stripe"</strong>. You'll be redirected to Stripe to create or link your account.</>} />
          <Step num={2} es="En Stripe completá tus datos: nombre, identificación fiscal y cuenta bancaria donde recibir los pagos." en="On Stripe fill in your details: name, tax ID, and bank account to receive payments." />
          <Step num={3} es={<>Una vez conectado, ingresá tu <strong>precio mensual</strong> en USD y hacé clic en <strong>Guardar</strong>.</>} en={<>Once connected, enter your <strong>monthly price</strong> in USD and click <strong>Save</strong>.</>} />
          <Step num={4} es={<>En la tabla <strong>"Clientes y estado de pago"</strong>, hacé clic en <strong>"Generar link"</strong> para cada cliente y enviáselo. El cliente paga con su tarjeta y el dinero llega a tu cuenta Stripe.</>} en={<>In the <strong>"Clients and payment status"</strong> table, click <strong>"Generate link"</strong> for each client and send it to them. The client pays with their card and the money goes to your Stripe account.</>} />
        </div>
        <Info es="💰 FitCoach retiene una comisión del 5% sobre cada cobro. El 95% restante va directamente a tu cuenta de Stripe." en="💰 FitCoach retains a 5% commission on each payment. The remaining 95% goes directly to your Stripe account." />
      </Section>

      {/* 7. PROFILE */}
      <Section id="perfil" icon="🌐" titleEs="Perfil Público" titleEn="Public Profile" subtitleEs="Tu carta de presentación en el directorio" subtitleEn="Your presentation card in the directory">
        <p className="text-sm text-muted-foreground mb-4">
          {lang === "es"
            ? "Cuando activás tu Perfil Público, aparecés en el directorio de entrenadores en fit-coach.vip/entrenadores, donde potenciales clientes pueden encontrarte y contactarte."
            : "When you activate your Public Profile, you appear in the trainer directory at fit-coach.vip/entrenadores, where potential clients can find and contact you."}
        </p>
        <div className="space-y-2">
          <Step num={1} es={<>Subí una <strong>foto de perfil</strong> profesional (máx. 5 MB). Se recorta automáticamente en formato cuadrado.</>} en={<>Upload a professional <strong>profile photo</strong> (max. 5 MB). It's automatically cropped to square format.</>} />
          <Step num={2} es={<>Completá tu <strong>especialidad</strong> (ej: Pérdida de peso, Musculación, Running).</>} en={<>Fill in your <strong>specialty</strong> (e.g.: Weight loss, Muscle building, Running).</>} />
          <Step num={3} es={<>Agregá tu <strong>ubicación</strong> (ciudad, país).</>} en={<>Add your <strong>location</strong> (city, country).</>} />
          <Step num={4} es={<>Escribí tu <strong>biografía</strong>: experiencia, certificaciones y cómo trabajás con tus clientes.</>} en={<>Write your <strong>bio</strong>: experience, certifications, and how you work with your clients.</>} />
          <Step num={5} es={<>Agregá tu usuario de <strong>Instagram</strong> si querés que aparezca en tu perfil.</>} en={<>Add your <strong>Instagram</strong> handle if you want it shown on your profile.</>} />
          <Step num={6} es={<>Hacé clic en <strong>"Guardar cambios"</strong> y luego en <strong>"Publicar mi perfil"</strong> para aparecer en el directorio público.</>} en={<>Click <strong>"Save changes"</strong> and then <strong>"Publish my profile"</strong> to appear in the public directory.</>} />
        </div>
        <Tip es="Un perfil completo con foto, bio y especialidad genera muchas más consultas. ¡Dedicale tiempo a completarlo bien!" en="A complete profile with photo, bio, and specialty generates many more inquiries. Take the time to fill it out properly!" />
      </Section>

      {/* 8. SUBSCRIPTION */}
      <Section id="suscripcion" icon="⚡" titleEs="Suscripción" titleEn="Subscription" subtitleEs="Elegí el plan que mejor se adapta a vos" subtitleEn="Choose the plan that best fits you">
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2">Plan</th>
                <th className="text-left px-3 py-2">{lang === "es" ? "Precio" : "Price"}</th>
                <th className="text-left px-3 py-2">{lang === "es" ? "Clientes" : "Clients"}</th>
                <th className="text-left px-3 py-2">{lang === "es" ? "Características" : "Features"}</th>
              </tr>
            </thead>
            <tbody>
              {planRows.map((r) => (
                <tr key={r.plan} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-bold">{r.plan}</td>
                  <td className="px-3 py-2 font-mono">{r.price}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{lang === "es" ? r.clientsEs : r.clientsEn}</td>
                  <td className="px-3 py-2 text-muted-foreground">{lang === "es" ? r.featEs : r.featEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <p className="text-center text-sm text-muted-foreground pb-8">
        {lang === "es" ? "¿Tenés dudas? Escribinos a " : "Questions? Contact us at "}
        <strong>info@ledorvador.us</strong>
      </p>
    </div>
  );
}
