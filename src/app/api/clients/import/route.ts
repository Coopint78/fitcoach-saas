import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ContactToImport {
  name: string;
  email?: string;
  phone?: string;
}

const PLAN_LIMITS: Record<string, number | null> = {
  trialing: 5,
  starter: 10,
  active: null,
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, subscription_status")
    .eq("user_id", session.user.id)
    .single();

  if (!trainer) return NextResponse.json({ error: "Trainer not found" }, { status: 404 });

  const { contacts }: { contacts: ContactToImport[] } = await req.json();
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
  }

  const limit = PLAN_LIMITS[trainer.subscription_status ?? "trialing"] ?? null;
  if (limit !== null) {
    const { count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("trainer_id", trainer.id);

    const available = limit - (count ?? 0);
    if (available <= 0) {
      return NextResponse.json({ error: "plan_limit_reached", available: 0 }, { status: 403 });
    }
    // Solo importar hasta el límite disponible
    contacts.splice(available);
  }

  const rows = contacts.map((c) => ({
    trainer_id: trainer.id,
    name: c.name,
    email: c.email || null,
    phone: c.phone || null,
    source: "contacts_import",
  }));

  const { data: created, error } = await supabase
    .from("clients")
    .insert(rows)
    .select("id, name, email, phone");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, imported: created?.length ?? 0, clients: created });
}
