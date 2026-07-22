"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Trainer {
  id: string;
  name: string;
  email: string;
  subscription_status: string;
  client_count: number;
  created_at: string;
  is_pro_free: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

interface Props {
  trainers: Trainer[];
  totalTrainers: number;
  totalClients: number;
  adminUsers: AdminUser[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/30",
    trial: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    expired: "bg-red-500/15 text-red-400 border-red-500/30",
    canceled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  const cls = map[status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-5">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard({ trainers: initialTrainers, totalTrainers, totalClients, adminUsers: initialAdminUsers }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "admins">("overview");
  const [trainers, setTrainers] = useState(initialTrainers);
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [grantingPro, setGrantingPro] = useState<string | null>(null);

  // Admin management state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState("");

  // Change password state
  const [changePwTarget, setChangePwTarget] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  // Change email state
  const [changeEmailTarget, setChangeEmailTarget] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  const proTrainers = trainers.filter((t) => t.subscription_status === "active").length;
  const trialTrainers = trainers.filter((t) => t.subscription_status === "trial").length;

  async function handleGrantPro(trainerId: string) {
    setGrantingPro(trainerId);
    const res = await fetch(`/api/admin/trainers/${trainerId}/grant-pro`, { method: "POST" });
    if (res.ok) {
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId ? { ...t, is_pro_free: true, subscription_status: "active" } : t
        )
      );
    }
    setGrantingPro(null);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAddingAdmin(true);
    setAddError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
    });

    const data = await res.json();
    setAddingAdmin(false);

    if (!res.ok) {
      setAddError(data.error ?? "Error al crear admin");
      return;
    }

    setAdminUsers((prev) => [...prev, data.user]);
    setShowAddForm(false);
    setNewAdminEmail("");
    setNewAdminPassword("");
  }

  async function handleDeleteAdmin(id: string) {
    if (!confirm("¿Eliminar este admin?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const data = await res.json();
      alert(data.error ?? "Error al eliminar");
    }
  }

  async function handleChangeEmail(id: string) {
    setChangingEmail(true);
    setEmailError("");

    const res = await fetch("/api/admin/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newEmail }),
    });

    const data = await res.json();
    setChangingEmail(false);

    if (!res.ok) {
      setEmailError(data.error ?? "Error al cambiar email");
      return;
    }

    setAdminUsers((prev) => prev.map((u) => u.id === id ? { ...u, email: newEmail } : u));
    setChangeEmailTarget(null);
    setNewEmail("");
  }

  async function handleChangePassword(email: string) {
    setChangingPw(true);
    setPwError("");

    const res = await fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword: newPw }),
    });

    const data = await res.json();
    setChangingPw(false);

    if (!res.ok) {
      setPwError(data.error ?? "Error al cambiar contraseña");
      return;
    }

    setChangePwTarget(null);
    setNewPw("");
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1f2e] border border-white/10 rounded-xl p-1 w-fit">
        {(["overview", "admins"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#A3E635] text-[#111827]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "overview" ? "Overview" : "Gestión de admins"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total entrenadores" value={totalTrainers} />
            <StatCard label="Total clientes" value={totalClients} />
            <StatCard label="Entrenadores Pro" value={proTrainers} />
            <StatCard label="En trial" value={trialTrainers} />
          </div>

          {/* Trainers table */}
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold">Entrenadores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Nombre</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Email</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Suscripción</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Clientes</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Registro</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-8">
                        No hay entrenadores registrados
                      </td>
                    </tr>
                  )}
                  {trainers.map((trainer) => (
                    <tr key={trainer.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-6 py-4 text-white font-medium">
                        {trainer.name ?? "—"}
                        {trainer.is_pro_free && (
                          <span className="ml-2 text-[10px] bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 px-1.5 py-0.5 rounded-full">
                            gratis
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{trainer.email}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trainer.subscription_status ?? "—"} />
                      </td>
                      <td className="px-6 py-4 text-gray-300">{trainer.client_count}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(trainer.created_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-6 py-4">
                        {trainer.subscription_status !== "active" && (
                          <button
                            onClick={() => handleGrantPro(trainer.id)}
                            disabled={grantingPro === trainer.id}
                            className="text-[#A3E635] hover:text-[#b5f040] text-xs font-medium border border-[#A3E635]/30 px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50"
                          >
                            {grantingPro === trainer.id ? "..." : "Dar Pro gratis"}
                          </button>
                        )}
                        {trainer.subscription_status === "active" && (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "admins" && (
        <div className="space-y-6">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold">Administradores</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#A3E635] text-[#111827] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#b5f040] transition-colors"
              >
                + Agregar admin
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddAdmin} className="px-6 py-4 border-b border-white/5 bg-white/2 space-y-3">
                <p className="text-white font-medium text-sm">Nuevo administrador</p>
                {addError && (
                  <p className="text-red-400 text-xs">{addError}</p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                    className="flex-1 min-w-[200px] bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    required
                    className="flex-1 min-w-[200px] bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                  />
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="bg-[#A3E635] text-[#111827] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#b5f040] transition-colors disabled:opacity-50"
                  >
                    {addingAdmin ? "Creando..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 text-sm px-3 py-2 rounded-lg hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div>
              {adminUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No hay administradores</p>
              )}
              {adminUsers.map((admin) => (
                <div key={admin.id} className="px-6 py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-white font-medium text-sm">{admin.email}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Creado {new Date(admin.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {changeEmailTarget === admin.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {emailError && <p className="text-red-400 text-xs w-full">{emailError}</p>}
                          <input
                            type="email"
                            placeholder="Nuevo email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-52"
                          />
                          <button
                            onClick={() => handleChangeEmail(admin.id)}
                            disabled={changingEmail || !newEmail}
                            className="text-[#A3E635] text-xs font-medium border border-[#A3E635]/30 px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50"
                          >
                            {changingEmail ? "..." : "Guardar"}
                          </button>
                          <button
                            onClick={() => { setChangeEmailTarget(null); setNewEmail(""); setEmailError(""); }}
                            className="text-gray-400 text-xs px-2 py-1.5 rounded-lg hover:text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : changePwTarget === admin.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {pwError && <p className="text-red-400 text-xs w-full">{pwError}</p>}
                          <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={newPw}
                            onChange={(e) => setNewPw(e.target.value)}
                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-48"
                          />
                          <button
                            onClick={() => handleChangePassword(admin.email)}
                            disabled={changingPw || !newPw}
                            className="text-[#A3E635] text-xs font-medium border border-[#A3E635]/30 px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50"
                          >
                            {changingPw ? "..." : "Guardar"}
                          </button>
                          <button
                            onClick={() => { setChangePwTarget(null); setNewPw(""); setPwError(""); }}
                            className="text-gray-400 text-xs px-2 py-1.5 rounded-lg hover:text-white"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setChangeEmailTarget(admin.id); setEmailError(""); setChangePwTarget(null); }}
                            className="text-gray-400 text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:text-white hover:border-white/20 transition-colors"
                          >
                            Cambiar email
                          </button>
                          <button
                            onClick={() => { setChangePwTarget(admin.id); setPwError(""); setChangeEmailTarget(null); }}
                            className="text-gray-400 text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:text-white hover:border-white/20 transition-colors"
                          >
                            Cambiar contraseña
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-400 text-xs border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
