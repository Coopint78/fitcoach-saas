import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";

// GET /api/progress/photos?client_id=xxx — list photos for a client
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("client_id");
  if (!clientId) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("client_photos")
    .select("*")
    .eq("client_id", clientId)
    .order("taken_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/progress/photos — upload a new photo
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase.from("trainers").select("id").eq("user_id", user.id).single();
  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("client_id") as string | null;
  const takenAt = formData.get("taken_at") as string | null;
  const note = formData.get("note") as string | null;

  if (!file || !clientId) return NextResponse.json({ error: "file and client_id required" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10 MB" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${user.id}/${clientId}/${Date.now()}.${ext}`;

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage.from("progress-photos").upload(filename, buffer, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from("progress-photos").getPublicUrl(filename);

  const { data, error } = await supabase.from("client_photos").insert({
    client_id: clientId,
    trainer_id: trainer.id,
    url: publicUrl,
    taken_at: takenAt || new Date().toISOString().split("T")[0],
    note: note || null,
    shared_with_client: false,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/progress/photos — update shared_with_client or note
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, shared_with_client, note } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (shared_with_client !== undefined) updates.shared_with_client = shared_with_client;
  if (note !== undefined) updates.note = note;

  const { error } = await supabase.from("client_photos").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/progress/photos — delete a photo
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("client_photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
