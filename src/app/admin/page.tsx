import { cookies } from "next/headers";
import AdminDashboard from "@/components/AdminDashboard";

async function getDashboardData() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin-session")?.value;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [dashRes, usersRes] = await Promise.all([
    fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Cookie: `admin-session=${sessionCookie}` },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/admin/users`, {
      headers: { Cookie: `admin-session=${sessionCookie}` },
      cache: "no-store",
    }),
  ]);

  const dashData = dashRes.ok ? await dashRes.json() : { trainers: [], totalTrainers: 0, totalClients: 0 };
  const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

  return { ...dashData, adminUsers: usersData.users ?? [] };
}

export default async function AdminPage() {
  const data = await getDashboardData();

  return (
    <AdminDashboard
      trainers={data.trainers ?? []}
      totalTrainers={data.totalTrainers ?? 0}
      totalClients={data.totalClients ?? 0}
      adminUsers={data.adminUsers ?? []}
    />
  );
}
