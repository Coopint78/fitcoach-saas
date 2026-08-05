import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getSafeErrorMessage } from "@/lib/error-safe";
import { validateUUID } from "@/lib/validation";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  try {
    validateUUID(id, "id");
  } catch {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { trial_ends_at } = body;

  if (!trial_ends_at) {
    return NextResponse.json({ error: "trial_ends_at es requerido" }, { status: 400 });
  }

  // Validate date format (ISO 8601)
  if (!/^\d{4}-\d{2}-\d{2}T/.test(trial_ends_at)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const supabase = adminSupabase();

  const { error } = await supabase
    .from("trainers")
    .update({ trial_ends_at, subscription_status: "trialing" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
