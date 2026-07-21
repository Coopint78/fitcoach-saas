"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

type Props = {
  publishableKey: string;
  secretKeyMasked: string;
};

export default function AdminStripeConfig({ publishableKey: initialPublishable, secretKeyMasked: initialMasked }: Props) {
  const [publishable, setPublishable] = useState(initialPublishable);
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasKeys = !!initialPublishable || !!initialMasked;

  async function save() {
    if (!publishable.trim()) { toast.error("La clave publicable es requerida"); return; }
    setSaving(true);
    const supabase = createClient();

    const updates: { key: string; value: string }[] = [
      { key: "stripe_publishable_key", value: publishable.trim() },
    ];

    if (secret.trim()) {
      const masked = secret.slice(0, 7) + "..." + secret.slice(-4);
      updates.push({ key: "stripe_secret_key_masked", value: masked });
      updates.push({ key: "stripe_secret_key", value: secret.trim() });
    }

    for (const row of updates) {
      await supabase.from("platform_config").upsert(row, { onConflict: "key" });
    }

    toast.success("Configuración guardada");
    setSecret("");
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      {hasKeys ? (
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle className="h-4 w-4" /> Stripe configurado
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-amber-500">
          <AlertCircle className="h-4 w-4" /> Stripe no configurado — las suscripciones no funcionarán hasta configurarlo
        </div>
      )}

      <div className="space-y-4 max-w-lg">
        <div className="space-y-1.5">
          <Label>Clave publicable (pk_live_... o pk_test_...)</Label>
          <Input
            value={publishable}
            onChange={e => setPublishable(e.target.value)}
            placeholder="pk_live_..."
            className="rounded-xl h-11 font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Clave secreta
            {initialMasked && <span className="ml-2 text-xs text-muted-foreground font-normal">Actual: {initialMasked}</span>}
          </Label>
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder={initialMasked ? "Dejar vacío para mantener la actual" : "sk_live_..."}
              className="rounded-xl h-11 font-mono text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            La clave secreta se almacena en la base de datos. Para máxima seguridad, configurala como variable de entorno en Vercel (<code className="font-mono bg-muted px-1 rounded">STRIPE_SECRET_KEY</code>).
          </p>
        </div>

        <Button onClick={save} disabled={saving} className="rounded-xl font-semibold h-11">
          {saving ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </div>
  );
}
