import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Find referral code
    const { data: referralData, error: referralError } = await supabase
      .from("referral_codes")
      .select("trainer_id")
      .eq("short_code", code)
      .single();

    if (referralError || !referralData) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Get trainer info
    const { data: trainerData, error: trainerError } = await supabase
      .from("trainers")
      .select(
        "id, username, name, specialty, location_country, location_state, location_city, location_zip_code, bio, instagram, profile_photo, public_profile"
      )
      .eq("id", referralData.trainer_id)
      .single();

    if (trainerError || !trainerData) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    return NextResponse.json({ trainer: trainerData });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
