import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Validate format
  if (!/^[a-z0-9_-]{3,20}$/.test(username.toLowerCase())) {
    return NextResponse.json({
      error: "Invalid format (3-20 chars, alphanumeric + underscore/dash only)",
    }, { status: 400 });
  }

  // Check if username is available (excluding current user)
  const { data: existing, error: checkError } = await supabase
    .from("trainers")
    .select("id")
    .eq("username", username.toLowerCase())
    .neq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 400 }
    );
  }

  // Update trainer's username
  const { error: updateError } = await supabase
    .from("trainers")
    .update({ username: username.toLowerCase() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update username" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    username: username.toLowerCase(),
  });
}
