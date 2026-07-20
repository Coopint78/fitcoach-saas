import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 400 });

  const { data } = await admin()
    .from("clients")
    .select("name, email, user_id")
    .eq("invite_token", token)
    .single();

  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { token, userId } = await req.json();
  if (!token || !userId) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { error } = await admin()
    .from("clients")
    .update({ user_id: userId })
    .eq("invite_token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
