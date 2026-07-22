import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import AdminLogoutButton from "@/components/AdminLogoutButton";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "fitcoach-admin-secret-2026"
);

async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return (payload as { email?: string }).email ?? null;
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const email = await getAdminEmail();

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <header className="bg-[#111827] border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-[#A3E635] flex items-center justify-center">
          <span className="text-[#111827] text-xs font-black">A</span>
        </div>
        <span className="text-white font-bold text-lg">FitCoach Admin</span>
        {email && (
          <span className="ml-auto text-gray-400 text-sm hidden sm:block">{email}</span>
        )}
        <AdminLogoutButton />
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
