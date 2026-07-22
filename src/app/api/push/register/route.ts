import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { token, platform } = body;
  if (!token || !platform) return NextResponse.json({ error: "Missing token or platform" }, { status: 400 });

  await supabase.from("push_tokens").upsert(
    { user_id: session.user.id, token, platform },
    { onConflict: "user_id,token" }
  );

  return NextResponse.json({ ok: true });
}
