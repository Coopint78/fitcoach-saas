import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo credentials - Spanish
const demoEmail = "demo@fitcoach.app";
const demoPassword = "DemoTrainer#2024!";
const demoName = "Juan García";
const demoSpecialty = "Pérdida de peso y tonificación";
const demoCountry = "AR";
const demoState = "";
const demoCity = "Buenos Aires";
const demoZipCode = "C1008";

// Demo credentials - English
const demoEmailEn = "demo-en@fitcoach.app";
const demoNameEn = "Sarah Johnson";
const demoSpecialtyEn = "Strength Training & Body Transformation";
const demoLocationEn = "Miami, Florida, USA";

async function deleteExistingDemo() {
  try {
    // Find auth user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const demoUser = authUsers.users?.find(u => u.email === demoEmail);

    if (demoUser) {
      // Delete trainer record first
      await supabase
        .from("trainers")
        .delete()
        .eq("user_id", demoUser.id);

      // Then delete auth user
      await supabase.auth.admin.deleteUser(demoUser.id);
      console.log("✅ Datos previos eliminados\n");
    }
  } catch (_err) {
    // Ignore errors if user doesn't exist
  }
}

async function seedDemoTrainer() {
  console.log("🚀 Iniciando seed de entrenador de demostración...\n");

  try {
    // Clean up existing demo trainer if it exists
    console.log("🧹 Limpiando datos previos...");
    await deleteExistingDemo();

    // 1. CREATE AUTH USER
    console.log("1️⃣ Creando usuario de autenticación...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { name: demoName, role: "trainer" },
    });

    if (authError) throw new Error(`Auth error: ${authError.message}`);
    const userId = authData.user!.id;
    console.log(`✅ Usuario creado: ${userId}\n`);

    // 2. CREATE TRAINER
    console.log("2️⃣ Creando perfil de entrenador...");
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: trainerData, error: trainerError } = await supabase
      .from("trainers")
      .upsert(
        {
          user_id: userId,
          name: demoName,
          email: demoEmail,
          trial_ends_at: trialEndsAt,
          subscription_status: "trialing",
          confirmed_at: new Date().toISOString(),
          specialty: demoSpecialty,
          location_country: demoCountry,
          location_state: demoState,
          location_city: demoCity,
          location_zip_code: demoZipCode,
          bio: "Especialista en pérdida de peso y musculación. Más de 10 años de experiencia ayudando clientes a transformar sus cuerpos con programas personalizados y sostenibles.",
          instagram: "@juangarcia.fit",
          public_profile: true,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (trainerError) throw new Error(`Trainer error: ${trainerError.message}`);
    const trainerId = trainerData.id;
    console.log(`✅ Entrenador creado: ${trainerId}\n`);

    // 3. CREATE EXERCISES
    console.log("3️⃣ Creando ejercicios base...");
    const exercises = [
      { name: "Press de banca", name_en: "Bench press", description: "Acostado en banco" },
      { name: "Sentadillas", name_en: "Squats", description: "Pesas libres o mancuernas" },
      { name: "Dominadas", name_en: "Pull-ups", description: "En barra" },
      { name: "Flexiones", name_en: "Push-ups", description: "Al peso corporal" },
      { name: "Peso muerto", name_en: "Deadlift", description: "Barra olímpica" },
      { name: "Remo con barra", name_en: "Barbell rows", description: "Espalda" },
      { name: "Curl de bíceps", name_en: "Bicep curls", description: "Mancuernas" },
      { name: "Extensiones de tríceps", name_en: "Tricep extensions", description: "Cable o mancuernas" },
      { name: "Planchas", name_en: "Planks", description: "Núcleo" },
      { name: "Sentadillas búlgaras", name_en: "Bulgarian squats", description: "Una pierna elevada" },
    ];

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("exercises")
      .insert(exercises.map((e) => ({ ...e, trainer_id: trainerId })))
      .select();

    if (exercisesError) throw new Error(`Exercises error: ${exercisesError.message}`);
    console.log(`✅ ${exercisesData.length} ejercicios creados\n`);

    // 4. CREATE ROUTINES
    console.log("4️⃣ Creando rutinas...");
    const routines = [
      { name: "Fuerza Total 3x/semana", description: "Rutina fullbody de fuerza" },
      { name: "Upper/Lower Split", description: "4 días: 2 upper, 2 lower" },
      { name: "Definición Muscular", description: "Hipertrofia con volumen moderado" },
    ];

    const { data: routinesData, error: routinesError } = await supabase
      .from("routines")
      .insert(routines.map((r) => ({ ...r, trainer_id: trainerId })))
      .select();

    if (routinesError) throw new Error(`Routines error: ${routinesError.message}`);
    console.log(`✅ ${routinesData.length} rutinas creadas\n`);

    // 5. ASSIGN EXERCISES TO ROUTINES
    console.log("5️⃣ Asignando ejercicios a rutinas...");
    const assignments = [
      // Routine 1: Fuerza Total
      { routine_id: routinesData[0].id, exercise_id: exercisesData[0].id, sets: 4, reps: "6-8", order: 1 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[1].id, sets: 4, reps: "6-8", order: 2 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[2].id, sets: 3, reps: "5-8", order: 3 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[4].id, sets: 3, reps: "3-5", order: 4 },
      // Routine 2: Upper/Lower
      { routine_id: routinesData[1].id, exercise_id: exercisesData[0].id, sets: 4, reps: "8-10", order: 1 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[5].id, sets: 4, reps: "8-10", order: 2 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[6].id, sets: 3, reps: "10-12", order: 3 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[7].id, sets: 3, reps: "10-12", order: 4 },
      // Routine 3: Definición
      { routine_id: routinesData[2].id, exercise_id: exercisesData[0].id, sets: 3, reps: "10-12", order: 1 },
      { routine_id: routinesData[2].id, exercise_id: exercisesData[1].id, sets: 3, reps: "12-15", order: 2 },
      { routine_id: routinesData[2].id, exercise_id: exercisesData[3].id, sets: 3, reps: "15-20", order: 3 },
      { routine_id: routinesData[2].id, exercise_id: exercisesData[8].id, sets: 3, reps: "30-45s", order: 4 },
    ];

    const { error: assignError } = await supabase.from("routine_items").insert(
      assignments.map((a) => ({
        routine_id: a.routine_id,
        exercise_id: a.exercise_id,
        sets: a.sets,
        reps: a.reps,
        order: a.order,
      }))
    );

    if (assignError) throw new Error(`Assignment error: ${assignError.message}`);
    console.log(`✅ ${assignments.length} ejercicios asignados a rutinas\n`);

    // 6. CREATE CLIENTS
    console.log("6️⃣ Creando clientes...");
    const clientsToCreate = [
      { name: "María López", email: "maria@example.com", goal: "Perder 15kg en 6 meses" },
      { name: "Carlos Rodríguez", email: "carlos@example.com", goal: "Ganar masa muscular" },
      { name: "Ana Martínez", email: "ana@example.com", goal: "Mejorar resistencia cardiovascular" },
      { name: "Diego Fernández", email: "diego@example.com", goal: "Tonificar y definir" },
    ];

    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .insert(clientsToCreate.map((c) => ({ ...c, trainer_id: trainerId })))
      .select();

    if (clientsError) throw new Error(`Clients error: ${clientsError.message}`);
    console.log(`✅ ${clientsData.length} clientes creados\n`);

    // 7. CREATE ASSIGNMENTS (assign routines to clients)
    console.log("7️⃣ Asignando rutinas a clientes...");
    const clientAssignments = [
      { client_id: clientsData[0].id, routine_id: routinesData[0].id }, // María - Fuerza Total
      { client_id: clientsData[1].id, routine_id: routinesData[1].id }, // Carlos - Upper/Lower
      { client_id: clientsData[2].id, routine_id: routinesData[0].id }, // Ana - Fuerza Total
      { client_id: clientsData[3].id, routine_id: routinesData[2].id }, // Diego - Definición
    ];

    const { error: assignClientsError } = await supabase
      .from("assignments")
      .insert(clientAssignments);

    if (assignClientsError) throw new Error(`Client assignment error: ${assignClientsError.message}`);
    console.log(`✅ Rutinas asignadas a clientes\n`);

    // 8. CREATE SESSIONS (appointments)
    console.log("8️⃣ Creando sesiones/citas...");
    const now = new Date();
    const sessions = [
      {
        trainer_id: trainerId,
        client_id: clientsData[0].id,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Sesión inicial - Evaluación",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[1].id,
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Sesión de seguimiento",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[2].id,
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        duration: 45,
        title: "Entrenamiento funcional",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[3].id,
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Sesión de musculación",
        status: "scheduled",
      },
    ];

    const { error: sessionsError } = await supabase.from("sessions").insert(
      sessions.map((s) => ({
        trainer_id: s.trainer_id,
        client_id: s.client_id,
        scheduled_at: s.date.toISOString(),
        duration_minutes: s.duration,
        title: s.title,
        status: s.status,
      }))
    );

    if (sessionsError) throw new Error(`Sessions error: ${sessionsError.message}`);
    console.log(`✅ ${sessions.length} sesiones creadas\n`);

    // 9. CREATE BLOCKED TIME (unavailable days)
    console.log("9️⃣ Configurando disponibilidad...");
    const blockedSlots = [
      {
        trainer_id: trainerId,
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        start_time: "00:00",
        end_time: "23:59",
        note: "Día de descanso",
      },
      {
        trainer_id: trainerId,
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        start_time: "00:00",
        end_time: "23:59",
        note: "Vacaciones",
      },
    ];

    const { error: blockedError } = await supabase.from("trainer_blocked_slots").insert(
      blockedSlots.map((b) => ({
        trainer_id: b.trainer_id,
        blocked_date: b.date.toISOString().split("T")[0],
        start_time: b.start_time,
        end_time: b.end_time,
        note: b.note,
      }))
    );

    if (blockedError) throw new Error(`Blocked slots error: ${blockedError.message}`);
    console.log(`✅ Disponibilidad configurada\n`);

    // 10. UPDATE TRAINER PROFILE
    console.log("🔟 Completando perfil del entrenador...");
    const { error: profileError } = await supabase
      .from("trainers")
      .update({
        bio: "Especialista en pérdida de peso y musculación con más de 10 años de experiencia. Certificado en entrenamiento personal y nutrición. Apasionado por ayudar a mis clientes a alcanzar sus objetivos de forma sostenible.",
        instagram: "@juangarcia.fit",
        public_profile: true,
      })
      .eq("id", trainerId);

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    console.log(`✅ Perfil completado\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ ¡SEED COMPLETADO EXITOSAMENTE! ✨");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📧 Email: " + demoEmail);
    console.log("🔑 Contraseña: " + demoPassword);
    console.log("\n📊 Datos creados:");
    console.log(`  • 1 Entrenador (${demoName})`);
    console.log(`  • 3 Rutinas de entrenamiento`);
    console.log(`  • 10 Ejercicios base`);
    console.log(`  • 4 Clientes`);
    console.log(`  • 4 Sesiones/citas programadas`);
    console.log(`  • 2 Días no disponibles`);
    console.log("\n🎯 Usa estas credenciales para presentaciones y demos.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedDemoTrainer();
