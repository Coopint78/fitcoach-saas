"use client";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, Dumbbell, ChevronRight } from "lucide-react";

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

export default function TrainerDirectory({ trainers }: { trainers: Trainer[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filtered = trainers.filter(t => {
    const q = query.toLowerCase();
    const matchQuery = !q || t.name.toLowerCase().includes(q) || (t.specialty ?? "").toLowerCase().includes(q) || (t.bio ?? "").toLowerCase().includes(q);
    const matchLoc = !locationFilter || (t.location ?? "").toLowerCase().includes(locationFilter.toLowerCase());
    return matchQuery && matchLoc;
  });

  const locations = [...new Set(trainers.map(t => t.location).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Dumbbell className="h-10 w-10 mx-auto mb-4 text-indigo-200" />
          <h1 className="text-4xl font-bold mb-3">{t("directory", "title")}</h1>
          <p className="text-indigo-200 text-lg mb-8">{t("directory", "subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("directory", "searchPlaceholder")}
                className="pl-9 bg-white text-gray-900 border-0 rounded-xl h-11"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                placeholder={t("directory", "cityPlaceholder")}
                className="pl-9 bg-white text-gray-900 border-0 rounded-xl h-11"
                list="locations"
              />
              <datalist id="locations">{locations.map(l => <option key={l} value={l} />)}</datalist>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length === 1
            ? t("directory", "resultsOne")
            : t("directory", "resultsMany").replace("{n}", String(filtered.length))}
        </p>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("directory", "noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(t => <TrainerCard key={t.id} trainer={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TrainerCard({ trainer: t }: { trainer: Parameters<typeof TrainerDirectory>[0]["trainers"][0] }) {
  const { t: i18n } = useLanguage();
  return (
    <Link href={`/entrenadores/${t.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full rounded-2xl border-0 shadow">
        <CardContent className="p-5">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-2xl bg-indigo-100 shrink-0 overflow-hidden flex items-center justify-center">
              {t.profile_photo ? (
                <img src={t.profile_photo} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-indigo-600">{t.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-900">{t.name}</h3>
                  {t.specialty && <Badge variant="secondary" className="text-xs mt-1">{t.specialty}</Badge>}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
              </div>
              {t.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <MapPin className="h-3 w-3" /> {t.location}
                </div>
              )}
              {t.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{t.bio}</p>}
              <div className="flex items-center gap-3 mt-3">
                {t.connect_enabled && t.coaching_price_cents ? (
                  <span className="text-sm font-semibold text-indigo-600">${(t.coaching_price_cents / 100).toFixed(0)}{i18n("directory", "perMonth")}</span>
                ) : null}
                {(t.client_count ?? 0) > 0 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="h-3 w-3" /> {t.client_count} {i18n("directory", "clients")}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
