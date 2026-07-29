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
    .select("id, name, email, subscription_status, created_at, is_pro_free, trial_ends_at")
    .order("created_at", { ascending: false });

  if (trainersError) {
    return NextResponse.json({ error: trainersError.message }, { status: 500 });
  }

  // Fetch all clients with trainer info
  const { data: clientRows } = await supabase
    .from("clients")
    .select("id, name, email, trainer_id, created_at")
    .order("created_at", { ascending: false });

  const trainerMap: Record<string, string> = {};
  for (const t of trainers ?? []) {
    trainerMap[t.id] = t.name ?? t.email ?? t.id;
  }

  const clients = (clientRows ?? []).map((c) => ({
    ...c,
    trainer_name: trainerMap[c.trainer_id] ?? "—",
  }));

  const countMap: Record<string, number> = {};
  for (const c of clients) {
    countMap[c.trainer_id] = (countMap[c.trainer_id] ?? 0) + 1;
  }

  const trainersWithCounts = (trainers ?? []).map((t) => ({
    ...t,
    is_pro_free: t.is_pro_free ?? false,
    client_count: countMap[t.id] ?? 0,
  }));

  return NextResponse.json({
    trainers: trainersWithCounts,
    totalTrainers: trainersWithCounts.length,
    totalClients: clients.length,
    clients,
  });
}
