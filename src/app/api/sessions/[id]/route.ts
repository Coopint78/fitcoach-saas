import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const body = await request.json();
  const allowed = ["status", "title", "notes", "scheduled_at", "duration_minutes", "completed_at", "client_rating", "client_note"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  if (body.status === "completed") updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .eq("trainer_id", trainer.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", session.user.id).single();
  if (!trainer) return NextResponse.json({ error: "Not a trainer" }, { status: 403 });

  const { error } = await supabase.from("sessions").delete().eq("id", id).eq("trainer_id", trainer.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
