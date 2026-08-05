import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate cryptographically secure random code (6 chars)
function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: authUser, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get trainer_id from authenticated user (don't trust client input)
    const { data: trainer, error: trainerError } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", authUser.user.id)
      .single();

    if (trainerError || !trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    const trainerId = trainer.id;

    // Check if trainer already has a referral code
    const { data: existing } = await supabase
      .from("referral_codes")
      .select("short_code")
      .eq("trainer_id", trainerId)
      .single();

    if (existing) {
      return NextResponse.json({ short_code: existing.short_code });
    }

    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: codeExists } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("short_code", shortCode)
        .single();

      if (!codeExists) {
        break;
      }

      shortCode = generateShortCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      );
    }

    // Insert new referral code
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({ trainer_id: trainerId, short_code: shortCode })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ short_code: data.short_code });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
