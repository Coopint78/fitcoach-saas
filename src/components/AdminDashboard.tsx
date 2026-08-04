"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface Trainer {
  id: string;
  name: string;
  email: string;
  subscription_status: string;
  client_count: number;
  created_at: string;
  is_pro_free: boolean;
  trial_ends_at?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  trainer_id: string;
  trainer_name?: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

interface Props {
  trainers: Trainer[];
  totalTrainers: number;
  totalClients: number;
  adminUsers: AdminUser[];
  clients: Client[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/30",
    trial: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    trialing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
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

type SortKey = "name" | "email" | "subscription_status" | "client_count" | "created_at" | "expiry";

export default function AdminDashboard({ trainers: initialTrainers, totalTrainers, totalClients, adminUsers: initialAdminUsers, clients: initialClients }: Props) {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState<"overview" | "trainers" | "admins" | "payments" | "clients">("overview");
  const [trainers, setTrainers] = useState(initialTrainers);
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);
  const [clients] = useState(initialClients);
  const [grantingPro, setGrantingPro] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("expiry");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getExpiry(tr: Trainer): number {
    if (tr.trial_ends_at) return new Date(tr.trial_ends_at).getTime();
    return Infinity;
  }

  const sortedTrainers = [...trainers].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = (a.name ?? "").localeCompare(b.name ?? "");
    else if (sortKey === "email") cmp = a.email.localeCompare(b.email);
    else if (sortKey === "subscription_status") cmp = a.subscription_status.localeCompare(b.subscription_status);
    else if (sortKey === "client_count") cmp = a.client_count - b.client_count;
    else if (sortKey === "created_at") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    else if (sortKey === "expiry") cmp = getExpiry(a) - getExpiry(b);
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Extend trial modal state
  const [extendTrialTarget, setExtendTrialTarget] = useState<string | null>(null);
  const [trialDate, setTrialDate] = useState("");
  const [extendingTrial, setExtendingTrial] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState("");

  const [changePwTarget, setChangePwTarget] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const [tempPassword, setTempPassword] = useState<{ adminId: string; password: string } | null>(null);
  const [resettingPw, setResettingPw] = useState<string | null>(null);

  const [showCreatePw, setShowCreatePw] = useState(false);

  const [changeEmailTarget, setChangeEmailTarget] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  const proTrainers = trainers.filter((tr) => tr.subscription_status === "active").length;
  const trialTrainers = trainers.filter((tr) => tr.subscription_status === "trial" || tr.subscription_status === "trialing").length;
  const paidTrainers = trainers.filter((tr) => tr.subscription_status === "active" && !tr.is_pro_free);
  const mrr = paidTrainers.length * 29;
  const commission = mrr * 0.05;

  async function handleDeleteTrainer(trainerId: string) {
    setDeletingId(trainerId);
    try {
      const res = await fetch(`/api/admin/trainers/${trainerId}/delete`, { method: "DELETE" });
      if (res.ok) {
        setTrainers((prev) => prev.filter((tr) => tr.id !== trainerId));
      } else {
        const data = await res.json();
        alert(data.error ?? "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
    setDeletingId(null);
    setDeleteStep((prev) => { const next = { ...prev }; delete next[trainerId]; return next; });
  }

  async function handleGrantPro(trainerId: string, plan: "starter" | "pro" = "pro") {
    setGrantingPro(trainerId + ":" + plan);
    const res = await fetch(`/api/admin/trainers/${trainerId}/grant-pro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      setTrainers((prev) =>
        prev.map((tr) =>
          tr.id === trainerId
            ? { ...tr, is_pro_free: plan === "pro", subscription_status: "active" }
            : tr
        )
      );
    }
    setGrantingPro(null);
  }

  async function handleExtendTrial(trainerId: string) {
    if (!trialDate) return;
    setExtendingTrial(true);
    const res = await fetch(`/api/admin/trainers/${trainerId}/extend-trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trial_ends_at: new Date(trialDate).toISOString() }),
    });
    if (res.ok) {
      setTrainers((prev) =>
        prev.map((tr) =>
          tr.id === trainerId
            ? { ...tr, trial_ends_at: trialDate, subscription_status: "trialing" }
            : tr
        )
      );
    }
    setExtendingTrial(false);
    setExtendTrialTarget(null);
    setTrialDate("");
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAddingAdmin(true);
    setAddError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, first_name: newFirstName || undefined, last_name: newLastName || undefined }),
    });

    const data = await res.json();
    setAddingAdmin(false);

    if (!res.ok) {
      setAddError(data.error ?? t("admin", "errorUpdate"));
      return;
    }

    setAdminUsers((prev) => [...prev, data.user]);
    setShowAddForm(false);
    setNewAdminEmail("");
    setNewAdminPassword("");
    setNewFirstName("");
    setNewLastName("");
  }

  async function handleDeleteAdmin(id: string) {
    if (!confirm(t("admin", "confirmDelete"))) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const data = await res.json();
      alert(data.error ?? t("admin", "errorDelete"));
    }
  }

  async function handleChangeProfile(id: string) {
    setChangingEmail(true);
    setEmailError("");

    const res = await fetch("/api/admin/auth/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newEmail: newEmail || undefined, first_name: newFirstName, last_name: newLastName }),
    });

    const data = await res.json();
    setChangingEmail(false);

    if (!res.ok) {
      setEmailError(data.error ?? t("admin", "errorUpdate"));
      return;
    }

    setAdminUsers((prev) => prev.map((u) => u.id === id ? {
      ...u,
      ...(newEmail ? { email: newEmail } : {}),
      first_name: newFirstName || u.first_name,
      last_name: newLastName || u.last_name,
    } : u));
    setChangeEmailTarget(null);
    setNewEmail("");
    setNewFirstName("");
    setNewLastName("");
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
      setPwError(data.error ?? t("admin", "errorUpdate"));
      return;
    }

    setChangePwTarget(null);
    setNewPw("");
    setShowNewPw(false);
  }

  async function handleResetPassword(admin: AdminUser) {
    if (!confirm(t("admin", "confirmReset").replace("{email}", admin.email))) return;
    setResettingPw(admin.id);

    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    const tmp = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    const res = await fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: admin.email, newPassword: tmp }),
    });

    setResettingPw(null);
    if (res.ok) {
      setTempPassword({ adminId: admin.id, password: tmp });
    } else {
      alert(t("admin", "errorReset"));
    }
  }

  const tabs = [
    { key: "overview" as const, label: t("admin", "tabOverview") },
    { key: "trainers" as const, label: "Entrenadores" },
    { key: "clients" as const, label: "Clientes" },
    { key: "payments" as const, label: "Ingresos $" },
    { key: "admins" as const, label: "Configuración" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1f2e] border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tb.key
                ? "bg-[#A3E635] text-[#111827]"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("admin", "statTrainers")} value={totalTrainers} />
            <StatCard label={t("admin", "statClients")} value={totalClients} />
            <StatCard label={t("admin", "statPro")} value={proTrainers} />
            <StatCard label={t("admin", "statTrial")} value={trialTrainers} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Últimos entrenadores */}
            <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Últimos entrenadores</h2>
                <button onClick={() => setTab("trainers")} className="text-xs text-[#A3E635] hover:underline">Ver todos</button>
              </div>
              <div className="divide-y divide-white/5">
                {trainers.slice(0, 5).map((tr) => (
                  <div key={tr.id} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{tr.name ?? tr.email}</p>
                      <p className="text-gray-500 text-xs">{tr.email}</p>
                    </div>
                    <StatusBadge status={tr.subscription_status} />
                  </div>
                ))}
                {trainers.length === 0 && <p className="text-gray-500 text-sm text-center py-6">Sin entrenadores aún.</p>}
              </div>
            </div>

            {/* Últimos clientes */}
            <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">Últimos clientes</h2>
                <button onClick={() => setTab("clients")} className="text-xs text-[#A3E635] hover:underline">Ver todos</button>
              </div>
              <div className="divide-y divide-white/5">
                {clients.slice(0, 5).map((cl) => (
                  <div key={cl.id} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{cl.name ?? cl.email}</p>
                      <p className="text-gray-500 text-xs">{cl.email}</p>
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {new Date(cl.created_at).toLocaleDateString(lang === "en" ? "en-US" : "es-AR")}
                    </span>
                  </div>
                ))}
                {clients.length === 0 && <p className="text-gray-500 text-sm text-center py-6">Sin clientes aún.</p>}
              </div>
            </div>
          </div>

          {/* Trial próximos a vencer */}
          {(() => {
            const soon = trainers.filter((tr) => {
              if (!tr.trial_ends_at) return false;
              const diff = (new Date(tr.trial_ends_at).getTime() - Date.now()) / 86400000;
              return diff >= 0 && diff <= 7;
            });
            if (soon.length === 0) return null;
            return (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-yellow-500/20">
                  <h2 className="text-yellow-300 font-semibold text-sm">⚠ Trials que vencen en los próximos 7 días</h2>
                </div>
                <div className="divide-y divide-yellow-500/10">
                  {soon.map((tr) => (
                    <div key={tr.id} className="px-6 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white text-sm font-medium">{tr.name ?? tr.email}</p>
                        <p className="text-yellow-400/70 text-xs">Vence: {new Date(tr.trial_ends_at!).toLocaleDateString(lang === "en" ? "en-US" : "es-AR")}</p>
                      </div>
                      <button
                        onClick={() => { setTab("trainers"); setExtendTrialTarget(tr.id); setTrialDate(""); }}
                        className="text-yellow-400 text-xs border border-yellow-500/30 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors"
                      >
                        Extender trial
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab === "trainers" && (
        <div className="space-y-6">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold">{t("admin", "trainersHeading")}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {(
                      [
                        { key: "name", label: t("admin", "colName") },
                        { key: "email", label: t("admin", "colEmail") },
                        { key: "subscription_status", label: t("admin", "colSubscription") },
                        { key: "client_count", label: t("admin", "colClients") },
                        { key: "expiry", label: "Vencimiento" },
                        { key: "created_at", label: t("admin", "colRegistered") },
                      ] as { key: SortKey; label: string }[]
                    ).map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key)}
                        className="text-left text-gray-400 font-medium px-6 py-3 cursor-pointer select-none hover:text-white transition-colors whitespace-nowrap"
                      >
                        {label}
                        <span className="ml-1 text-xs">
                          {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                        </span>
                      </th>
                    ))}
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTrainers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-8">
                        {t("admin", "noTrainersRow")}
                      </td>
                    </tr>
                  )}
                  {sortedTrainers.map((trainer) => {
                    const expiry = trainer.trial_ends_at
                      ? new Date(trainer.trial_ends_at)
                      : null;
                    const daysLeft = expiry
                      ? Math.ceil((expiry.getTime() - Date.now()) / 86400000)
                      : null;
                    return (
                      <tr key={trainer.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                        <td className="px-6 py-4 text-white font-medium">
                          {trainer.name ?? "—"}
                          {trainer.is_pro_free && (
                            <span className="ml-2 text-[10px] bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 px-1.5 py-0.5 rounded-full">
                              {t("admin", "freeBadge")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{trainer.email}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={trainer.subscription_status ?? "—"} />
                        </td>
                        <td className="px-6 py-4 text-gray-300">{trainer.client_count}</td>
                        <td className="px-6 py-4">
                          {expiry ? (
                            <span className={`text-xs font-medium ${daysLeft !== null && daysLeft <= 0 ? "text-red-400" : daysLeft !== null && daysLeft <= 7 ? "text-yellow-400" : "text-gray-300"}`}>
                              {expiry.toLocaleDateString(lang === "en" ? "en-US" : "es-AR")}
                              {daysLeft !== null && daysLeft > 0 && (
                                <span className="ml-1 text-gray-500">({daysLeft}d)</span>
                              )}
                              {daysLeft !== null && daysLeft <= 0 && (
                                <span className="ml-1 text-red-500">(vencido)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(trainer.created_at).toLocaleDateString(lang === "en" ? "en-US" : "es-AR")}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-nowrap items-center gap-1">
                            {trainer.subscription_status !== "active" && (
                              <>
                                <button
                                  onClick={() => handleGrantPro(trainer.id, "starter")}
                                  disabled={grantingPro === trainer.id + ":starter"}
                                  className="text-blue-400 hover:text-blue-300 text-[11px] font-medium border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                  {grantingPro === trainer.id + ":starter" ? "..." : "Starter"}
                                </button>
                                <button
                                  onClick={() => handleGrantPro(trainer.id, "pro")}
                                  disabled={grantingPro === trainer.id + ":pro"}
                                  className="text-[#A3E635] hover:text-[#b5f040] text-[11px] font-medium border border-[#A3E635]/30 px-2 py-1 rounded hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                  {grantingPro === trainer.id + ":pro" ? "..." : "Pro"}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => { setExtendTrialTarget(trainer.id); setTrialDate(""); }}
                              className="text-yellow-400 hover:text-yellow-300 text-[11px] font-medium border border-yellow-500/30 px-2 py-1 rounded hover:bg-yellow-500/10 transition-colors whitespace-nowrap"
                            >
                              +Trial
                            </button>
                            {trainer.subscription_status === "active" && (
                              <span className="text-gray-600 text-[11px]">activo</span>
                            )}
                            {/* Delete trainer */}
                            {deleteStep[trainer.id] === 1 ? (
                              <>
                                <span className="text-red-400 text-[11px] font-medium whitespace-nowrap">¿Seguro?</span>
                                <button
                                  onClick={() => handleDeleteTrainer(trainer.id)}
                                  disabled={deletingId === trainer.id}
                                  className="text-white text-[11px] font-bold bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                  {deletingId === trainer.id ? "..." : "Sí"}
                                </button>
                                <button
                                  onClick={() => setDeleteStep((prev) => { const next = { ...prev }; delete next[trainer.id]; return next; })}
                                  className="text-gray-400 text-[11px] border border-white/20 px-2 py-1 rounded hover:text-white transition-colors whitespace-nowrap"
                                >
                                  No
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteStep((prev) => ({ ...prev, [trainer.id]: 1 }))}
                                className="text-red-400 hover:text-red-300 text-[11px] font-medium border border-red-500/30 px-2 py-1 rounded hover:bg-red-500/10 transition-colors whitespace-nowrap"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("admin", "mrrLabel")} value={`$${mrr}`} sub="/mes" />
            <StatCard label={t("admin", "commissionLabel")} value={`$${commission.toFixed(2)}`} sub="/mes" />
            <StatCard label={t("admin", "paidCount")} value={paidTrainers.length} />
            <StatCard label={t("admin", "freeCount")} value={totalTrainers - paidTrainers.length} />
          </div>

          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold">{t("admin", "revenueTable")}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colName")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colEmail")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colSubscription")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colRevenue")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colCommission")}</th>
                  </tr>
                </thead>
                <tbody>
                  {trainers.map((trainer) => {
                    const isPaid = trainer.subscription_status === "active" && !trainer.is_pro_free;
                    const revenue = isPaid ? 29 : 0;
                    return (
                      <tr key={trainer.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                        <td className="px-6 py-4 text-white font-medium">
                          {trainer.name ?? "—"}
                          {trainer.is_pro_free && (
                            <span className="ml-2 text-[10px] bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 px-1.5 py-0.5 rounded-full">
                              {t("admin", "freeBadge")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{trainer.email}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={trainer.subscription_status ?? "—"} />
                        </td>
                        <td className="px-6 py-4 text-white font-medium">
                          {isPaid ? "$29" : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-6 py-4 text-[#A3E635]">
                          {isPaid ? "$1.45" : <span className="text-gray-600">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="px-6 py-3 text-gray-600 text-xs border-t border-white/5">{t("admin", "paymentsNote")}</p>
          </div>
        </div>
      )}

      {tab === "clients" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("admin", "statClients")} value={totalClients} />
          </div>

          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold">Clientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colName")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colEmail")}</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">Entrenador</th>
                    <th className="text-left text-gray-400 font-medium px-6 py-3">{t("admin", "colRegistered")}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-8">
                        No hay clientes registrados.
                      </td>
                    </tr>
                  )}
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-6 py-4 text-white font-medium">{client.name ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-300">{client.email}</td>
                      <td className="px-6 py-4 text-gray-300">{client.trainer_name ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(client.created_at).toLocaleDateString(lang === "en" ? "en-US" : "es-AR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Extend trial modal */}
      {extendTrialTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 mx-4">
            <h3 className="text-white font-semibold">Extender período de trial</h3>
            <p className="text-gray-400 text-sm">Selecciona la nueva fecha de vencimiento del trial.</p>
            <input
              type="date"
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#A3E635]/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleExtendTrial(extendTrialTarget)}
                disabled={extendingTrial || !trialDate}
                className="flex-1 bg-[#A3E635] text-[#111827] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#b5f040] transition-colors disabled:opacity-50"
              >
                {extendingTrial ? t("common", "saving") : t("common", "save")}
              </button>
              <button
                onClick={() => { setExtendTrialTarget(null); setTrialDate(""); }}
                className="flex-1 text-gray-300 text-sm border border-white/20 px-4 py-2 rounded-lg hover:text-white transition-colors"
              >
                {t("common", "cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "admins" && (
        <div className="space-y-6">
          <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold">{t("admin", "adminsHeading")}</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#A3E635] text-[#111827] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#b5f040] transition-colors"
              >
                {t("admin", "addAdmin")}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddAdmin} className="px-6 py-4 border-b border-white/5 bg-white/2 space-y-3">
                <p className="text-white font-medium text-sm">{t("admin", "newAdmin")}</p>
                {addError && <p className="text-red-400 text-xs">{addError}</p>}
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="text"
                    placeholder={t("admin", "firstName")}
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="flex-1 min-w-[150px] bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                  />
                  <input
                    type="text"
                    placeholder={t("admin", "lastName")}
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="flex-1 min-w-[150px] bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                  />
                  <input
                    type="email"
                    placeholder={t("admin", "colEmail")}
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    required
                    className="flex-1 min-w-[200px] bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                  />
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type={showCreatePw ? "text" : "password"}
                      placeholder={t("admin", "password")}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      required
                      className="w-full bg-[#0f1117] border border-white/10 rounded-lg px-3 py-2 pr-9 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50"
                    />
                    <button type="button" onClick={() => setShowCreatePw(!showCreatePw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showCreatePw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={addingAdmin}
                    className="bg-[#A3E635] text-[#111827] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#b5f040] transition-colors disabled:opacity-50"
                  >
                    {addingAdmin ? t("admin", "creating") : t("admin", "create")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-300 text-sm px-3 py-2 rounded-lg hover:text-white transition-colors"
                  >
                    {t("admin", "cancel")}
                  </button>
                </div>
              </form>
            )}

            <div>
              {adminUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">{t("admin", "noAdmins")}</p>
              )}
              {adminUsers.map((admin) => (
                <div key={admin.id} className="px-6 py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      {(admin.first_name || admin.last_name) && (
                        <p className="text-white font-medium text-sm">{[admin.first_name, admin.last_name].filter(Boolean).join(" ")}</p>
                      )}
                      <p className={admin.first_name || admin.last_name ? "text-gray-400 text-xs" : "text-white font-medium text-sm"}>{admin.email}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {t("admin", "createdOn").replace("{date}", new Date(admin.created_at).toLocaleDateString(lang === "en" ? "en-US" : "es-AR"))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {changeEmailTarget === admin.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {emailError && <p className="text-red-400 text-xs w-full">{emailError}</p>}
                          <input
                            type="text"
                            placeholder={t("admin", "firstName")}
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-36"
                          />
                          <input
                            type="text"
                            placeholder={t("admin", "lastName")}
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-36"
                          />
                          <input
                            type="email"
                            placeholder={t("admin", "newEmail")}
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-52"
                          />
                          <button
                            onClick={() => handleChangeProfile(admin.id)}
                            disabled={changingEmail}
                            className="text-[#A3E635] text-xs font-medium border border-[#A3E635]/30 px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50"
                          >
                            {changingEmail ? "..." : t("admin", "save")}
                          </button>
                          <button
                            onClick={() => { setChangeEmailTarget(null); setNewEmail(""); setNewFirstName(""); setNewLastName(""); setEmailError(""); }}
                            className="text-gray-300 text-xs px-2 py-1.5 rounded-lg hover:text-white"
                          >
                            {t("admin", "cancel")}
                          </button>
                        </div>
                      ) : changePwTarget === admin.id ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {pwError && <p className="text-red-400 text-xs w-full">{pwError}</p>}
                          <div className="relative">
                            <input
                              type={showNewPw ? "text" : "password"}
                              placeholder={t("admin", "newPassword")}
                              value={newPw}
                              onChange={(e) => setNewPw(e.target.value)}
                              className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 pr-9 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#A3E635]/50 w-48"
                            />
                            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                              {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <button
                            onClick={() => handleChangePassword(admin.email)}
                            disabled={changingPw || !newPw}
                            className="text-[#A3E635] text-xs font-medium border border-[#A3E635]/30 px-3 py-1.5 rounded-lg hover:bg-[#A3E635]/10 transition-colors disabled:opacity-50"
                          >
                            {changingPw ? "..." : t("admin", "save")}
                          </button>
                          <button
                            onClick={() => { setChangePwTarget(null); setNewPw(""); setPwError(""); setShowNewPw(false); }}
                            className="text-gray-300 text-xs px-2 py-1.5 rounded-lg hover:text-white"
                          >
                            {t("admin", "cancel")}
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setChangeEmailTarget(admin.id); setNewFirstName(admin.first_name ?? ""); setNewLastName(admin.last_name ?? ""); setNewEmail(admin.email); setEmailError(""); setChangePwTarget(null); }}
                            className="text-gray-300 text-xs border border-white/20 px-3 py-1.5 rounded-lg hover:text-white hover:border-white/40 transition-colors"
                          >
                            {t("admin", "editProfile")}
                          </button>
                          <button
                            onClick={() => { setChangePwTarget(admin.id); setPwError(""); setChangeEmailTarget(null); setTempPassword(null); }}
                            className="text-gray-300 text-xs border border-white/20 px-3 py-1.5 rounded-lg hover:text-white hover:border-white/40 transition-colors"
                          >
                            {t("admin", "changePassword")}
                          </button>
                          <button
                            onClick={() => { setTempPassword(null); handleResetPassword(admin); }}
                            disabled={resettingPw === admin.id}
                            className="text-yellow-400 text-xs border border-yellow-500/20 px-3 py-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
                          >
                            {resettingPw === admin.id ? "..." : t("admin", "resetPassword")}
                          </button>
                        </>
                      )}
                      {tempPassword?.adminId === admin.id && (
                        <div className="flex items-center gap-2 bg-[#A3E635]/10 border border-[#A3E635]/30 rounded-lg px-3 py-1.5">
                          <span className="text-[#A3E635] text-xs font-mono">{tempPassword.password}</span>
                          <button onClick={() => { navigator.clipboard.writeText(tempPassword.password); }} className="text-[#A3E635]/60 hover:text-[#A3E635] text-xs">{t("admin", "copy")}</button>
                          <button onClick={() => setTempPassword(null)} className="text-gray-500 hover:text-white text-xs ml-1">✕</button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-red-400 text-xs border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        {t("admin", "deleteAdmin")}
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
