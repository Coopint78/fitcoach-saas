import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { routine_id, new_name } = await req.json();

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  // Fetch source routine (must belong to this trainer)
  const { data: source } = await supabase
    .from("routines")
    .select("id, name, description, routine_items(exercise_id, sets, reps, order)")
    .eq("id", routine_id)
    .eq("trainer_id", trainer.id)
    .single();

  if (!source) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  // Create new routine
  const { data: newRoutine, error: routineErr } = await supabase
    .from("routines")
    .insert({ trainer_id: trainer.id, name: new_name ?? `${source.name} (copia)`, description: source.description ?? null })
    .select()
    .single();

  if (routineErr || !newRoutine) return NextResponse.json({ error: routineErr?.message ?? "Error" }, { status: 500 });

  // Copy items
  const items = (source.routine_items ?? []) as { exercise_id: string; sets: number; reps: string; order: number }[];
  if (items.length > 0) {
    const { error: itemsErr } = await supabase.from("routine_items").insert(
      items.map(i => ({ routine_id: newRoutine.id, exercise_id: i.exercise_id, sets: i.sets, reps: i.reps, order: i.order }))
    );
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: newRoutine.id, name: newRoutine.name });
}
