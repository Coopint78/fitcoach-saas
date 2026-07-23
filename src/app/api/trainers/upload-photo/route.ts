import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Validate type and size (max 5 MB)
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `trainer-photos/${user.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("trainer-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("trainer-photos")
    .getPublicUrl(path);

  // Persist URL to trainers table
  await supabase
    .from("trainers")
    .update({ profile_photo: publicUrl })
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true, url: publicUrl });
}
