import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/verificar-email?error=invalid", req.url));
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: trainer, error } = await adminClient
    .from("trainers")
    .select("id, confirmed_at")
    .eq("confirm_token", token)
    .single();

  if (error || !trainer) {
    return NextResponse.redirect(new URL("/verificar-email?error=invalid", req.url));
  }

  if (trainer.confirmed_at) {
    return NextResponse.redirect(new URL("/login?confirmed=already", req.url));
  }

  await adminClient
    .from("trainers")
    .update({ confirmed_at: new Date().toISOString(), confirm_token: null })
    .eq("id", trainer.id);

  return NextResponse.redirect(new URL("/login?confirmed=1", req.url));
}
