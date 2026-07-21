"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

export default function InvitacionPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const [client, setClient] = useState<{ name: string; email: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const res = await fetch(`/api/invitacion?token=${token}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      if (data.user_id) { router.push("/portal"); return; }
      setClient({ name: data.name, email: data.email });
    }
    checkToken();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error(t("invite", "passwordTooShort")); return; }
    setLoading(true);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: client!.email,
      password,
      options: { data: { role: "client", name: client!.name } },
    });

    if (error || !authData.user) {
      toast.error(error?.message ?? t("invite", "errorCreate"));
      setLoading(false);
      return;
    }

    await fetch("/api/invitacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId: authData.user.id }),
    });

    setDone(true);
    setLoading(false);
  }

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full text-center p-6">
        <p className="text-gray-600">{t("invite", "invalid")}</p>
        <Button className="mt-4" onClick={() => router.push("/login")}>{t("invite", "goHome")}</Button>
      </Card>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full text-center p-6 space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold">{t("invite", "accountCreated")}</h2>
        <p className="text-gray-600">{t("invite", "canSeeRoutines")}</p>
        <Button onClick={() => router.push("/portal")} className="w-full">{t("invite", "viewRoutines")}</Button>
      </Card>
    </div>
  );

  if (!client) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">{t("invite", "loading")}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-xl text-indigo-600 mb-2">
            <Dumbbell className="h-6 w-6" /> FitCoach
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("invite", "hello").replace("{name}", client.name)}</CardTitle>
            <CardDescription>{t("invite", "desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-1">
                <Label>{t("invite", "emailLabel")}</Label>
                <Input value={client.email} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-1">
                <Label>{t("invite", "passwordLabel")}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder={t("invite", "passwordPlaceholder")} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? t("invite", "creating") : t("invite", "activate")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
