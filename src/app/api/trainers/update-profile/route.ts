import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      bio,
      specialty,
      location_country,
      location_state,
      location_city,
      location_zip_code,
      instagram,
      profile_photo,
      public_profile,
    } = await req.json();

    // Get user from auth token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info from token
    const { data: authUser, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get trainer by user_id
    const { data: trainer, error: trainerError } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", authUser.user.id)
      .single();

    if (trainerError || !trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    // Validate required fields
    if (!location_country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    if (!location_zip_code) {
      return NextResponse.json(
        { error: "Zip code is required" },
        { status: 400 }
      );
    }

    // Update trainer
    const { error: updateError } = await supabase
      .from("trainers")
      .update({
        bio,
        specialty,
        location_country,
        location_state,
        location_city,
        location_zip_code,
        instagram,
        profile_photo,
        public_profile,
      })
      .eq("id", trainer.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
