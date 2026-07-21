import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_id, weight_kg, waist_cm, hips_cm, chest_cm, notes, photo_url } = await req.json();

  // Verify the client belongs to this user (as client or trainer)
  const { data: clientRow } = await supabase
    .from("clients")
    .select("id")
    .eq("id", client_id)
    .or(`user_id.eq.${user.id},trainer_id.in.(select id from trainers where user_id='${user.id}')`)
    .single();

  if (!clientRow) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const { data, error } = await supabase.from("body_metrics").insert({
    client_id,
    weight_kg: weight_kg ?? null,
    waist_cm: waist_cm ?? null,
    hips_cm: hips_cm ?? null,
    chest_cm: chest_cm ?? null,
    notes: notes ?? null,
    photo_url: photo_url ?? null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
