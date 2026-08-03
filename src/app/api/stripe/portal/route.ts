import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pool from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = await pool.query(
      `SELECT stripe_customer_id FROM trainers WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const trainer = rows[0] ?? null;
    if (!trainer?.stripe_customer_id) return NextResponse.json({ error: "No customer" }, { status: 400 });

    const session = await stripe.billingPortal.sessions.create({
      customer: trainer.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
