import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin/auth";

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
  const supabase = adminSupabase();

  // Try to set is_pro_free — column may not exist yet; handle gracefully
  const { error } = await supabase
    .from("trainers")
    .update({ is_pro_free: true, subscription_status: "active" })
    .eq("id", id);

  if (error) {
    // If error is about missing column, still update subscription_status
    if (error.message.includes("is_pro_free")) {
      const { error: fallbackError } = await supabase
        .from("trainers")
        .update({ subscription_status: "active" })
        .eq("id", id);

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, note: "is_pro_free column not yet migrated" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
