import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import ClienteDetailClient from "@/components/ClienteDetailClient";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");

  const { rows: trainerRows } = await pool.query(
    `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
    [user.id]
  );
  const trainer = trainerRows[0] ?? null;
  if (!trainer) redirect("/login");

  const { rows: clientRows } = await pool.query(
    `SELECT id, name, email, user_id, goal, notes, phone, birthdate, gender, height_cm, weight_kg, address, invite_token
     FROM clients
     WHERE id = $1 AND trainer_id = $2
     LIMIT 1`,
    [id, trainer.id]
  );
  const client = clientRows[0] ?? null;
  if (!client) notFound();

  // Fetch assignments with routine items + exercises
  const { rows: assignmentRows } = await pool.query(
    `SELECT a.id, a.routine_id,
      r.id AS r_id, r.name AS r_name
     FROM assignments a
     LEFT JOIN routines r ON r.id = a.routine_id
     WHERE a.client_id = $1`,
    [client.id]
  );

  // Fetch all routine items + exercises for each assigned routine
  const routineIds = assignmentRows.map((a: any) => a.routine_id).filter(Boolean);
  let routineItemRows: any[] = [];
  if (routineIds.length > 0) {
    const { rows } = await pool.query(
      `SELECT ri.id, ri.routine_id, ri.exercise_id, ri.sets, ri.reps, ri.order,
              e.id AS ex_id, e.name AS ex_name, e.name_es, e.name_en, e.is_system
       FROM routine_items ri
       JOIN exercises e ON e.id = ri.exercise_id
       WHERE ri.routine_id = ANY($1)
       ORDER BY ri.routine_id, ri.order`,
      [routineIds]
    );
    routineItemRows = rows;
  }

  // Fetch existing notes for this client
  let existingNotes: any[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT routine_item_id, notes FROM routine_item_notes WHERE client_id = $1`,
      [client.id]
    );
    existingNotes = rows;
  } catch {
    // Table may not exist yet
  }

  const notesMap: Record<string, string> = {};
  existingNotes.forEach((n: any) => { notesMap[n.routine_item_id] = n.notes; });

  // Build assignments with items
  const assignments = assignmentRows.map((a: any) => ({
    id: a.id,
    routine_id: a.routine_id,
    routine: a.r_id ? { id: a.r_id, name: a.r_name } : null,
    items: routineItemRows
      .filter((ri: any) => ri.routine_id === a.routine_id)
      .map((ri: any) => ({
        id: ri.id,
        exercise_id: ri.exercise_id,
        sets: ri.sets,
        reps: ri.reps,
        order: ri.order,
        coach_notes: notesMap[ri.id] ?? null,
        exercise: {
          id: ri.ex_id,
          name: ri.ex_name,
          name_es: ri.name_es,
          name_en: ri.name_en,
          is_system: ri.is_system,
        },
      })),
  }));

  const { rows: routineRows } = await pool.query(
    `SELECT id, name FROM routines WHERE trainer_id = $1`,
    [trainer.id]
  );

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invitacion/${client.invite_token}`;

  return (
    <ClienteDetailClient
      client={client}
      trainerId={trainer.id}
      routines={routineRows}
      assignments={assignments}
      inviteLink={inviteLink}
    />
  );
}
