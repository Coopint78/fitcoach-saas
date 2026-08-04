import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Validate format: 3-20 chars, alphanumeric + underscore/dash only
  if (!/^[a-z0-9_-]{3,20}$/.test(username.toLowerCase())) {
    return NextResponse.json({
      available: false,
      reason: "Invalid format (3-20 chars, alphanumeric + underscore/dash only)",
    });
  }

  const supabase = await createClient();

  // Check if username exists
  const { data, error } = await supabase
    .from("trainers")
    .select("id")
    .eq("username", username.toLowerCase())
    .single();

  // If error is "no rows" that's good (username available)
  if (error?.code === "PGRST116") {
    return NextResponse.json({ available: true });
  }

  // If there's actual data, username is taken
  if (data) {
    return NextResponse.json({ available: false, reason: "Username taken" });
  }

  // Any other error
  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ available: false, reason: "Username taken" });
}
