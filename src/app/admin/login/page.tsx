import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="h-9 w-9 rounded-xl bg-[#A3E635] flex items-center justify-center">
            <span className="text-[#111827] text-sm font-black">A</span>
          </div>
          <span className="text-white font-bold text-xl">FitCoach Admin</span>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
