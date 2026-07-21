import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { price_usd } = await req.json();
  const cents = Math.round(Number(price_usd) * 100);
  if (isNaN(cents) || cents < 100)
    return NextResponse.json({ error: "Price must be at least $1" }, { status: 400 });

  const { error } = await supabase
    .from("trainers")
    .update({ coaching_price_cents: cents })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, coaching_price_cents: cents });
}
