import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSafeErrorMessage } from "@/lib/error-safe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("code, name, name_es")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: getSafeErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: getSafeErrorMessage(error) },
      { status: 500 }
    );
  }
}
