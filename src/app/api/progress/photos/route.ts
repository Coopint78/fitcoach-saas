import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fit-coach.vip";

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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const relativePath = `${user.id}/${clientId}/${Date.now()}.${ext}`;
  const fullPath = path.join(UPLOADS_DIR, relativePath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  const publicUrl = `${APP_URL}/uploads/${relativePath}`;

  const { data, error } = await supabase.from("client_photos").insert({
    client_id: clientId,
    trainer_id: trainer.id,
    url: publicUrl,
    taken_at: takenAt || new Date().toISOString().split("T")[0],
    note: note || null,
    shared_with_client: false,
  }).select().single();

  if (error) {
    await fs.unlink(fullPath).catch(() => {});
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

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

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Get URL before deleting row so we can remove the file
  const { data: photo } = await supabase.from("client_photos").select("url").eq("id", id).single();

  const { error } = await supabase.from("client_photos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Remove file from disk (best-effort)
  if (photo?.url) {
    const urlPath = new URL(photo.url).pathname.replace("/uploads/", "");
    const fullPath = path.join(UPLOADS_DIR, urlPath);
    await fs.unlink(fullPath).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
