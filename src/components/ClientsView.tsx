"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Mail, Target, User, Plus, Phone, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Client = {
  id: string; name: string; email: string;
  goal?: string | null; user_id?: string | null;
  phone?: string | null; birthdate?: string | null; gender?: string | null;
};

function calcAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div className={`${s} rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ClientsView({ clients }: { clients: Client[] }) {
  const { t } = useLanguage();
  const [view, setView] = useState<"card" | "list">("card");

  if (clients.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <User className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">{t("clients", "noClients")}</h3>
        <p className="text-sm text-muted-foreground mb-6">{t("clients", "noClientsDesc")}</p>
        <Link href="/dashboard/clientes/nuevo">
          <Button className="rounded-xl font-semibold gap-2"><Plus className="h-4 w-4" />{t("clients", "addFirst")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex justify-end gap-1">
        <Button
          variant={view === "card" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("card")}
          title={t("clients", "cardView")}
          className={`px-2.5 h-8 rounded-lg ${view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("list")}
          title={t("clients", "listView")}
          className={`px-2.5 h-8 rounded-lg ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {view === "card" ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clientes/${client.id}`}>
              <Card className="rounded-2xl border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer group h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{client.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />{client.email}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs shrink-0 font-medium ${client.user_id ? "bg-primary/15 text-primary border-primary/20" : "bg-muted text-muted-foreground"}`}
                    >
                      {client.user_id ? t("clients", "active") : t("clients", "invited")}
                    </Badge>
                  </div>
                  {client.goal && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Target className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{client.goal}</span>
                    </p>
                  )}
                  {(client.phone || client.birthdate) && (
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                      {client.birthdate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{calcAge(client.birthdate)} {t("clients", "age")}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-border overflow-hidden">
          <div className="divide-y divide-border">
            {clients.map((client) => (
              <Link key={client.id} href={`/dashboard/clientes/${client.id}`}>
                <div className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={client.name} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    {client.phone && (
                      <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                        <Phone className="h-3 w-3" />{client.phone}
                      </span>
                    )}
                    {client.birthdate && (
                      <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{calcAge(client.birthdate)} {t("clients", "age")}
                      </span>
                    )}
                    {client.goal && (
                      <span className="text-xs text-muted-foreground hidden lg:block max-w-40 truncate">{client.goal}</span>
                    )}
                    <Badge className={`text-xs font-medium ${client.user_id ? "bg-primary/15 text-primary border-primary/20" : "bg-muted text-muted-foreground"}`}>
                      {client.user_id ? t("clients", "active") : t("clients", "invited")}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
