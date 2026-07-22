import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date().toISOString();
  const to = searchParams.get("to") ?? new Date(Date.now() + 30 * 86400000).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("*, client:clients(id, name, email)")
    .eq("trainer_id", trainer.id)
    .gte("scheduled_at", from)
    .lte("scheduled_at", to)
    .order("scheduled_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id, session_duration_minutes").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const body = await request.json();
  const { client_id, scheduled_at, duration_minutes, title, notes } = body;

  if (!client_id || !scheduled_at) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await supabase.from("sessions").insert({
    trainer_id: trainer.id,
    client_id,
    scheduled_at,
    duration_minutes: duration_minutes ?? trainer.session_duration_minutes ?? 60,
    title: title ?? null,
    notes: notes ?? null,
    status: "scheduled",
    requested_by: "trainer",
    confirmed_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
