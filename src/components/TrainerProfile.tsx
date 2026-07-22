"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, Globe, DollarSign, Dumbbell } from "lucide-react";

type Trainer = {
  id: string;
  name: string;
  bio: string | null;
  specialty: string | null;
  location: string | null;
  profile_photo: string | null;
  instagram: string | null;
  website: string | null;
  coaching_price_cents: number | null;
  connect_enabled: boolean | null;
  client_count: number | null;
};

export default function TrainerProfile({ trainer: t }: { trainer: Trainer }) {
  const { t: i18n } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Link href="/entrenadores">
          <Button variant="ghost" size="sm" className="gap-1 text-gray-600"><ArrowLeft className="h-4 w-4" /> {i18n("trainerProfile", "backToDirectory")}</Button>
        </Link>

        <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
          <div className="bg-indigo-600 h-24" />
          <CardContent className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="h-20 w-20 rounded-2xl border-4 border-white bg-indigo-100 overflow-hidden flex items-center justify-center shrink-0 shadow">
                {t.profile_photo ? (
                  <img src={t.profile_photo} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">{t.name.charAt(0)}</span>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-gray-900">{t.name}</h1>
                {t.specialty && <Badge variant="secondary" className="mt-1">{t.specialty}</Badge>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
              {t.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" /> {t.location}</span>}
              {(t.client_count ?? 0) > 0 && <span className="flex items-center gap-1"><Users className="h-4 w-4 text-gray-400" /> {t.client_count} {i18n("trainerProfile", "clients")}</span>}
            </div>

            {t.bio && <p className="text-gray-700 leading-relaxed mb-6">{t.bio}</p>}

            <div className="flex flex-wrap gap-3">
              {t.instagram && (
                <a href={`https://instagram.com/${t.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    📷 @{t.instagram.replace("@", "")}
                  </Button>
                </a>
              )}
              {t.website && (
                <a href={t.website.startsWith("http") ? t.website : `https://${t.website}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Globe className="h-4 w-4" /> {i18n("trainerProfile", "website")}
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing card */}
        {t.connect_enabled && t.coaching_price_cents ? (
          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" /> {i18n("trainerProfile", "monthlyCoaching")}
                  </h2>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">${(t.coaching_price_cents / 100).toFixed(0)}<span className="text-base font-normal text-gray-500">{i18n("trainerProfile", "perMonth")}</span></p>
                  <p className="text-sm text-gray-500 mt-1">{i18n("trainerProfile", "coachingDesc")}</p>
                </div>
                <Link href="/registro">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                    {i18n("trainerProfile", "getStarted")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-0 shadow-md">
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">{i18n("trainerProfile", "workWithTrainer").replace("{name}", t.name)}</p>
              <Link href="/registro">
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl w-full">{i18n("trainerProfile", "createFreeAccount")}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
