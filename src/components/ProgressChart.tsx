"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format } from "date-fns";
import { useLanguage } from "@/lib/i18n/context";

type Metric = {
  logged_at: string;
  weight_kg: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  chest_cm: number | null;
};

type Props = { metrics: Metric[]; metric: keyof Omit<Metric, "logged_at">; label: string; color: string; unit: string };

export default function ProgressChart({ metrics, metric, label, color, unit }: Props) {
  const { t } = useLanguage();
  const data = metrics
    .filter(m => m[metric] != null)
    .map(m => ({
      date: format(new Date(m.logged_at), "dd/MM"),
      value: m[metric],
    }));

  if (data.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">{t("progress", "noRecordsChart")}</p>;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit={unit} />
          <Tooltip formatter={(v) => [`${v} ${unit}`, label]} />
          <Legend />
          <Line type="monotone" dataKey="value" name={label} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
