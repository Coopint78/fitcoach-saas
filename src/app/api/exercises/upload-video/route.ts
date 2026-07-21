import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const maxSize = 100 * 1024 * 1024; // 100 MB
  if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 100 MB)" }, { status: 400 });

  const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/avi"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "mp4";
  const filename = `${user.id}/${Date.now()}.${ext}`;

  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await adminClient.storage
    .from("exercise-videos")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = adminClient.storage
    .from("exercise-videos")
    .getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
