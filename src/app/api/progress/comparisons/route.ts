import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/progress/comparisons?client_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("client_photo_comparisons")
    .select("*, before:photo_before_id(id,url,taken_at,note), after:photo_after_id(id,url,taken_at,note)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/progress/comparisons — create a comparison
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 403 });

  const { client_id, photo_before_id, photo_after_id } = await req.json();
  if (!client_id || !photo_before_id || !photo_after_id)
    return NextResponse.json({ error: "client_id, photo_before_id and photo_after_id required" }, { status: 400 });

  const { data, error } = await supabase.from("client_photo_comparisons").insert({
    client_id,
    trainer_id: trainer.id,
    photo_before_id,
    photo_after_id,
    shared_with_client: false,
  }).select("*, before:photo_before_id(id,url,taken_at,note), after:photo_after_id(id,url,taken_at,note)").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/progress/comparisons — toggle shared_with_client
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, shared_with_client } = await req.json();
  if (!id || shared_with_client === undefined)
    return NextResponse.json({ error: "id and shared_with_client required" }, { status: 400 });

  const { error } = await supabase.from("client_photo_comparisons").update({ shared_with_client }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/progress/comparisons
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("client_photo_comparisons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
