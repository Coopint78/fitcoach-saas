"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  name_es: string;
}

interface USState {
  code: string;
  name: string;
  name_es: string;
}

interface LocationSelectorProps {
  onCountryChange: (country: string) => void;
  onStateChange: (state: string | null) => void;
  onCityChange: (city: string) => void;
  onZipCodeChange: (zipCode: string) => void;
  selectedCountry?: string | null;
  selectedState?: string | null;
  selectedCity?: string | null;
  selectedZipCode?: string | null;
}

export default function LocationSelector({
  onCountryChange,
  onStateChange,
  onCityChange,
  onZipCodeChange,
  selectedCountry,
  selectedState,
  selectedCity,
  selectedZipCode,
}: LocationSelectorProps) {
  const { lang } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<USState[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Load countries and states on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real app, you'd fetch from your API
        // For now, we'll load from a hardcoded list or API
        const countryRes = await fetch("/api/countries");
        const countryData = await countryRes.json();
        setCountries(countryData);

        const statesRes = await fetch("/api/states/us");
        const statesData = await statesRes.json();
        setStates(statesData);
      } catch (error) {
        console.error("Error loading location data:", error);
      }
    };

    loadData();
  }, []);

  const filteredCountries = countries.filter((c) => {
    const name = lang === "es" ? c.name_es : c.name;
    return name.toLowerCase().includes(countrySearch.toLowerCase());
  });

  const isUSA = selectedCountry === "US";

  const t = {
    country: lang === "es" ? "País" : "Country",
    state: lang === "es" ? "Estado/Provincia" : "State/Province",
    city: lang === "es" ? "Ciudad" : "City",
    zipCode: lang === "es" ? "Código Postal" : "Zip Code",
    selectCountry: lang === "es" ? "Seleccionar país" : "Select country",
    selectState: lang === "es" ? "Seleccionar estado" : "Select state",
    enterCity: lang === "es" ? "Ingrese ciudad" : "Enter city",
    enterZipCode: lang === "es" ? "Ingrese código postal" : "Enter zip code",
    required: lang === "es" ? "Requerido" : "Required",
  };

  return (
    <div className="space-y-4">
      {/* Country Selector with Search */}
      <div>
        <Label className="text-white text-sm font-medium">
          {t.country} <span className="text-red-500">*</span>
        </Label>
        <div className="relative mt-1">
          <Input
            type="text"
            placeholder={t.selectCountry}
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              setShowCountryDropdown(true);
            }}
            onFocus={() => setShowCountryDropdown(true)}
            className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500"
          />
          {showCountryDropdown && countrySearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1f2e] border border-white/10 rounded-lg max-h-60 overflow-y-auto z-50">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      const name = lang === "es" ? country.name_es : country.name;
                      setCountrySearch(name);
                      onCountryChange(country.code);
                      setShowCountryDropdown(false);
                      onStateChange(""); // Reset state when country changes
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    {lang === "es" ? country.name_es : country.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">{t.selectCountry}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* State Selector (only for USA) */}
      {isUSA && (
        <div>
          <Label className="text-white text-sm font-medium">
            {t.state} <span className="text-gray-500">(optional)</span>
          </Label>
          <Select value={selectedState || ""} onValueChange={onStateChange}>
            <SelectTrigger className="bg-[#1a1f2e] border-white/10 text-white mt-1">
              <SelectValue placeholder={t.selectState} />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1f2e] border-white/10">
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {lang === "es" ? state.name_es : state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* City */}
      <div>
        <Label className="text-white text-sm font-medium">
          {t.city} <span className="text-gray-500">(optional)</span>
        </Label>
        <Input
          type="text"
          placeholder={t.enterCity}
          value={selectedCity || ""}
          onChange={(e) => onCityChange(e.target.value)}
          className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500 mt-1"
        />
      </div>

      {/* Zip Code */}
      <div>
        <Label className="text-white text-sm font-medium">
          {t.zipCode} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder={t.enterZipCode}
          value={selectedZipCode || ""}
          onChange={(e) => onZipCodeChange(e.target.value)}
          className="bg-[#1a1f2e] border-white/10 text-white placeholder:text-gray-500 mt-1"
        />
      </div>
    </div>
  );
}
