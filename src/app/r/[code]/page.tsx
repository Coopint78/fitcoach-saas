import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

export default async function ReferralCodePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;

  try {
    // Find referral code
    const { data: referralData } = await supabase
      .from("referral_codes")
      .select("trainer_id")
      .eq("short_code", code)
      .single();

    if (!referralData) {
      redirect("/");
    }

    // Get trainer username
    const { data: trainerData } = await supabase
      .from("trainers")
      .select("username")
      .eq("id", referralData.trainer_id)
      .single();

    if (!trainerData?.username) {
      redirect("/");
    }

    // Redirect to the full referral profile page
    redirect(`/ref/${trainerData.username}`);
  } catch (error) {
    redirect("/");
  }
}
