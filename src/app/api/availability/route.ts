import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id, session_duration_minutes").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const { data } = await supabase.from("trainer_availability").select("*").eq("trainer_id", trainer.id).order("day_of_week").order("start_time");
  return NextResponse.json({ slots: data ?? [], session_duration_minutes: trainer.session_duration_minutes });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const body = await request.json();
  const { slots, session_duration_minutes } = body;

  await supabase.from("trainer_availability").delete().eq("trainer_id", trainer.id);

  if (slots?.length > 0) {
    const rows = slots.map((s: { day_of_week: number; start_time: string; end_time: string }) => ({
      trainer_id: trainer.id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
    }));
    await supabase.from("trainer_availability").insert(rows);
  }

  if (session_duration_minutes) {
    await supabase.from("trainers").update({ session_duration_minutes }).eq("id", trainer.id);
  }

  return NextResponse.json({ ok: true });
}
