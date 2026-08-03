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

  const { rows: assignmentRows } = await pool.query(
    `SELECT a.id, a.routine_id,
      CASE WHEN r.id IS NOT NULL
        THEN json_build_object('id', r.id, 'name', r.name)
        ELSE NULL
      END AS routine
     FROM assignments a
     LEFT JOIN routines r ON r.id = a.routine_id
     WHERE a.client_id = $1`,
    [client.id]
  );

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
      assignments={assignmentRows as { id: string; routine_id: string; routine: { id: string; name: string } | null }[]}
      inviteLink={inviteLink}
    />
  );
}
