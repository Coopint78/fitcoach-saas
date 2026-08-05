import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate random alphanumeric code (6 chars)
function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { trainerId } = await req.json();

    if (!trainerId) {
      return NextResponse.json({ error: "trainerId required" }, { status: 400 });
    }

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
