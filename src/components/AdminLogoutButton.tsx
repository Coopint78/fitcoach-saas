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
      className="ml-auto sm:ml-2 text-gray-300 hover:text-white text-sm border border-white/20 px-3 py-1.5 rounded-lg hover:border-white/40 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
