import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getTrainerId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("trainers").select("id").eq("user_id", userId).single();
  return data?.id ?? null;
}

// GET /api/sessions/blocked — list blocked slots for the authenticated trainer
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainerId = await getTrainerId(supabase, user.id);
  if (!trainerId) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("trainer_blocked_slots")
    .select("*")
    .eq("trainer_id", trainerId)
    .gte("blocked_date", new Date().toISOString().split("T")[0])
    .order("blocked_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sessions/blocked — create a blocked slot
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trainerId = await getTrainerId(supabase, user.id);
  if (!trainerId) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  const body = await req.json();
  const { blocked_date, start_time, end_time, note } = body;
  if (!blocked_date) return NextResponse.json({ error: "blocked_date required" }, { status: 400 });

  const { data, error } = await supabase
    .from("trainer_blocked_slots")
    .insert({ trainer_id: trainerId, blocked_date, start_time: start_time || null, end_time: end_time || null, note: note || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/sessions/blocked?id=xxx — delete a blocked slot
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("trainer_blocked_slots")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
