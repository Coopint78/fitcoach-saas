import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["info@ledorvador.us"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#111827] border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-[#A3E635] flex items-center justify-center">
          <span className="text-[#111827] text-xs font-black">A</span>
        </div>
        <span className="text-white font-bold text-lg">FitCoach Admin</span>
        <span className="ml-auto text-gray-400 text-sm">{user.email}</span>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
