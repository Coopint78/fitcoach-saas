import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: trainer } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!trainer) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav trainer={trainer} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
