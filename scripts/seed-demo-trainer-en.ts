import { createClient } from "@supabase/supabase-js";

const adminSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!adminSecret) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  adminSecret
);

// Demo credentials - English
const demoEmail = "demo-en@fitcoach.app";
const demoPassword = "DemoTrainer#2024!";
const demoName = "Sarah Johnson";
const demoSpecialty = "Strength Training & Body Transformation";
const demoCountry = "US";
const demoState = "FL";
const demoCity = "Miami";
const demoZipCode = "33101";

async function deleteExistingDemo() {
  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const demoUser = authUsers.users?.find(u => u.email === demoEmail);

    if (demoUser) {
      await supabase
        .from("trainers")
        .delete()
        .eq("user_id", demoUser.id);

      await supabase.auth.admin.deleteUser(demoUser.id);
      console.log("✅ Previous data removed\n");
    }
  } catch (_err) {
    // Ignore errors if user doesn't exist
  }
}

async function seedDemoTrainer() {
  console.log("🚀 Starting English demo trainer seed...\n");

  try {
    // Clean up existing demo trainer if it exists
    console.log("🧹 Cleaning up previous data...");
    await deleteExistingDemo();

    // 1. CREATE AUTH USER
    console.log("1️⃣ Creating authentication user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { name: demoName, role: "trainer" },
    });

    if (authError) throw new Error(`Auth error: ${authError.message}`);
    const userId = authData.user!.id;
    console.log(`✅ User created: ${userId}\n`);

    // 2. CREATE TRAINER
    console.log("2️⃣ Creating trainer profile...");
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
          bio: "Certified strength coach with 8+ years of experience helping clients build muscle, increase strength, and transform their bodies through personalized training programs.",
          instagram: "@sarahjohnson.fit",
          public_profile: true,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (trainerError) throw new Error(`Trainer error: ${trainerError.message}`);
    const trainerId = trainerData.id;
    console.log(`✅ Trainer created: ${trainerId}\n`);

    // 3. CREATE EXERCISES
    console.log("3️⃣ Creating base exercises...");
    const exercises = [
      { name: "Bench Press", name_en: "Bench press", description: "Lying on flat bench" },
      { name: "Squats", name_en: "Squats", description: "Free weights or barbell" },
      { name: "Pull-ups", name_en: "Pull-ups", description: "On bar" },
      { name: "Push-ups", name_en: "Push-ups", description: "Bodyweight" },
      { name: "Deadlifts", name_en: "Deadlift", description: "Olympic bar" },
      { name: "Barbell Rows", name_en: "Barbell rows", description: "Back exercise" },
      { name: "Bicep Curls", name_en: "Bicep curls", description: "Dumbbells" },
      { name: "Tricep Extensions", name_en: "Tricep extensions", description: "Cable or dumbbells" },
      { name: "Planks", name_en: "Planks", description: "Core work" },
      { name: "Bulgarian Split Squats", name_en: "Bulgarian squats", description: "Single leg elevated" },
    ];

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("exercises")
      .insert(exercises.map((e) => ({ ...e, trainer_id: trainerId })))
      .select();

    if (exercisesError) throw new Error(`Exercises error: ${exercisesError.message}`);
    console.log(`✅ ${exercisesData.length} exercises created\n`);

    // 4. CREATE ROUTINES
    console.log("4️⃣ Creating routines...");
    const routines = [
      { name: "Total Strength 3x/week", description: "Full body strength routine" },
      { name: "Push/Pull/Legs Split", description: "4 days: 2 push, 2 pull, 2 legs" },
      { name: "Hypertrophy Builder", description: "Moderate volume for muscle growth" },
    ];

    const { data: routinesData, error: routinesError } = await supabase
      .from("routines")
      .insert(routines.map((r) => ({ ...r, trainer_id: trainerId })))
      .select();

    if (routinesError) throw new Error(`Routines error: ${routinesError.message}`);
    console.log(`✅ ${routinesData.length} routines created\n`);

    // 5. ASSIGN EXERCISES TO ROUTINES
    console.log("5️⃣ Assigning exercises to routines...");
    const assignments = [
      // Routine 1: Total Strength
      { routine_id: routinesData[0].id, exercise_id: exercisesData[0].id, sets: 4, reps: "6-8", order: 1 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[1].id, sets: 4, reps: "6-8", order: 2 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[2].id, sets: 3, reps: "5-8", order: 3 },
      { routine_id: routinesData[0].id, exercise_id: exercisesData[4].id, sets: 3, reps: "3-5", order: 4 },
      // Routine 2: Push/Pull/Legs
      { routine_id: routinesData[1].id, exercise_id: exercisesData[0].id, sets: 4, reps: "8-10", order: 1 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[5].id, sets: 4, reps: "8-10", order: 2 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[6].id, sets: 3, reps: "10-12", order: 3 },
      { routine_id: routinesData[1].id, exercise_id: exercisesData[7].id, sets: 3, reps: "10-12", order: 4 },
      // Routine 3: Hypertrophy
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
    console.log(`✅ ${assignments.length} exercises assigned to routines\n`);

    // 6. CREATE CLIENTS
    console.log("6️⃣ Creating clients...");
    const clientsToCreate = [
      { name: "John Smith", email: "john@example.com", goal: "Build muscle and gain 20 lbs of lean mass" },
      { name: "Emily Davis", email: "emily@example.com", goal: "Increase strength and power" },
      { name: "Michael Brown", email: "michael@example.com", goal: "Lose 30 lbs and get shredded" },
      { name: "Jessica Wilson", email: "jessica@example.com", goal: "Transform body composition" },
    ];

    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .insert(clientsToCreate.map((c) => ({ ...c, trainer_id: trainerId })))
      .select();

    if (clientsError) throw new Error(`Clients error: ${clientsError.message}`);
    console.log(`✅ ${clientsData.length} clients created\n`);

    // 7. CREATE ASSIGNMENTS (assign routines to clients)
    console.log("7️⃣ Assigning routines to clients...");
    const clientAssignments = [
      { client_id: clientsData[0].id, routine_id: routinesData[0].id },
      { client_id: clientsData[1].id, routine_id: routinesData[1].id },
      { client_id: clientsData[2].id, routine_id: routinesData[0].id },
      { client_id: clientsData[3].id, routine_id: routinesData[2].id },
    ];

    const { error: assignClientsError } = await supabase
      .from("assignments")
      .insert(clientAssignments);

    if (assignClientsError) throw new Error(`Client assignment error: ${assignClientsError.message}`);
    console.log(`✅ Routines assigned to clients\n`);

    // 8. CREATE SESSIONS (appointments)
    console.log("8️⃣ Creating sessions/appointments...");
    const now = new Date();
    const sessions = [
      {
        trainer_id: trainerId,
        client_id: clientsData[0].id,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Initial Assessment & Consultation",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[1].id,
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Progress Check-in",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[2].id,
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        duration: 45,
        title: "Advanced Training Session",
        status: "scheduled",
      },
      {
        trainer_id: trainerId,
        client_id: clientsData[3].id,
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        title: "Strength & Conditioning",
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
    console.log(`✅ ${sessions.length} sessions created\n`);

    // 9. CREATE BLOCKED TIME (unavailable days)
    console.log("9️⃣ Setting availability...");
    const blockedSlots = [
      {
        trainer_id: trainerId,
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        start_time: "00:00",
        end_time: "23:59",
        note: "Rest day",
      },
      {
        trainer_id: trainerId,
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        start_time: "00:00",
        end_time: "23:59",
        note: "Vacation",
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
    console.log(`✅ Availability configured\n`);

    // 10. UPDATE TRAINER PROFILE
    console.log("🔟 Completing trainer profile...");
    const { error: profileError } = await supabase
      .from("trainers")
      .update({
        bio: "Certified strength coach with 8+ years of experience helping clients build muscle, increase strength, and transform their bodies through personalized training programs and nutrition guidance.",
        instagram: "@sarahjohnson.fit",
        public_profile: true,
      })
      .eq("id", trainerId);

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    console.log(`✅ Profile completed\n`);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ ENGLISH SEED COMPLETED SUCCESSFULLY! ✨");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📧 Email: " + demoEmail);
    console.log("🔑 Password: " + demoPassword);
    console.log("\n📊 Data created:");
    console.log(`  • 1 Trainer (${demoName})`);
    console.log(`  • 3 Training routines`);
    console.log(`  • 10 Base exercises`);
    console.log(`  • 4 Clients`);
    console.log(`  • 4 Scheduled sessions`);
    console.log(`  • 2 Unavailable days`);
    console.log("\n🎯 Use these credentials for presentations and demos.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedDemoTrainer();
