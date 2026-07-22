"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="ml-auto sm:ml-2 text-gray-400 hover:text-white text-sm border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
