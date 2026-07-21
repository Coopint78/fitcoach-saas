import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const admin = createAdminClient();

  // Delete existing bad user
  const { data: existing } = await admin.auth.admin.listUsers();
  const luciana = existing.users.find(u => u.email === "lucianadelyesso@gmail.com");
  if (luciana) {
    await admin.auth.admin.deleteUser(luciana.id);
  }

  // Create user properly via admin API
  const { data, error } = await admin.auth.admin.createUser({
    email: "lucianadelyesso@gmail.com",
    password: "Fitcoach123!",
    email_confirm: true,
    user_metadata: { role: "client", name: "Luciana Del Yesso" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update clients table with new user_id
  const { error: updateError } = await admin
    .from("clients")
    .update({ user_id: data.user.id })
    .eq("email", "lucianadelyesso@gmail.com");

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true, userId: data.user.id });
}
