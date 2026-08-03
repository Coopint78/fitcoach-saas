import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows: trainerRows } = await pool.query(
      `SELECT id, session_duration_minutes FROM trainers WHERE user_id = $1 LIMIT 1`,
      [session.user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

    const { rows: slots } = await pool.query(
      `SELECT * FROM trainer_availability WHERE trainer_id = $1 ORDER BY day_of_week, start_time`,
      [trainer.id]
    );
    return NextResponse.json({ slots, session_duration_minutes: trainer.session_duration_minutes });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows: trainerRows } = await pool.query(
      `SELECT id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [session.user.id]
    );
    const trainer = trainerRows[0] ?? null;
    if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

    const body = await request.json();
    const { slots, session_duration_minutes } = body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM trainer_availability WHERE trainer_id = $1`, [trainer.id]);

      if (slots?.length > 0) {
        const valuePlaceholders = (slots as { day_of_week: number; start_time: string; end_time: string }[])
          .map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`).join(", ");
        const params: unknown[] = [trainer.id];
        for (const s of slots as { day_of_week: number; start_time: string; end_time: string }[]) {
          params.push(s.day_of_week, s.start_time, s.end_time);
        }
        await client.query(
          `INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time) VALUES ${valuePlaceholders}`,
          params
        );
      }

      if (session_duration_minutes) {
        await client.query(
          `UPDATE trainers SET session_duration_minutes = $1 WHERE id = $2`,
          [session_duration_minutes, trainer.id]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
