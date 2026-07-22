import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin/auth";

// Migration note: ALTER TABLE trainers ADD COLUMN IF NOT EXISTS is_pro_free boolean DEFAULT false;

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = adminSupabase();

  const { data: trainers, error: trainersError } = await supabase
    .from("trainers")
    .select("id, name, email, subscription_status, created_at, is_pro_free")
    .order("created_at", { ascending: false });

  if (trainersError) {
    return NextResponse.json({ error: trainersError.message }, { status: 500 });
  }

  // Count clients per trainer
  const { data: clientCounts } = await supabase
    .from("clients")
    .select("trainer_id");

  const countMap: Record<string, number> = {};
  for (const row of clientCounts ?? []) {
    countMap[row.trainer_id] = (countMap[row.trainer_id] ?? 0) + 1;
  }

  const trainersWithCounts = (trainers ?? []).map((t) => ({
    ...t,
    is_pro_free: t.is_pro_free ?? false,
    client_count: countMap[t.id] ?? 0,
  }));

  return NextResponse.json({
    trainers: trainersWithCounts,
    totalTrainers: trainersWithCounts.length,
    totalClients: Object.values(countMap).reduce((a, b) => a + b, 0),
  });
}
