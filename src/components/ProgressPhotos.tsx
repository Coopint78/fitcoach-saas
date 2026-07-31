"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, X, GitCompare, Share2, Trash2, Eye, EyeOff, Plus, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type Photo = {
  id: string;
  url: string;
  taken_at: string;
  note: string | null;
  shared_with_client: boolean;
};

type Comparison = {
  id: string;
  shared_with_client: boolean;
  before: Photo;
  after: Photo;
};

type Mode = "gallery" | "compare" | "comparisons";

export default function ProgressPhotos({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { lang } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<Mode>("gallery");
  const [selected, setSelected] = useState<Photo[]>([]);
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split("T")[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const s = (es: string, en: string) => lang === "es" ? es : en;

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/progress/photos?client_id=${clientId}`),
      fetch(`/api/progress/comparisons?client_id=${clientId}`),
    ]);
    if (pRes.ok) setPhotos(await pRes.json());
    if (cRes.ok) setComparisons(await cRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [clientId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("client_id", clientId);
      fd.append("taken_at", takenAt);
      const res = await fetch("/api/progress/photos", { method: "POST", body: fd });
      if (!res.ok) { toast.error(s("Error al subir foto", "Upload error")); }
    }
    toast.success(s("Foto(s) subida(s)", "Photo(s) uploaded"));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function toggleShare(photo: Photo) {
    const res = await fetch("/api/progress/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, shared_with_client: !photo.shared_with_client }),
    });
    if (res.ok) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, shared_with_client: !p.shared_with_client } : p));
      toast.success(photo.shared_with_client ? s("Foto ocultada al cliente", "Photo hidden from client") : s("Foto compartida con el cliente", "Photo shared with client"));
    }
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm(s("¿Eliminar esta foto?", "Delete this photo?"))) return;
    const res = await fetch("/api/progress/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id }),
    });
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      setSelected(prev => prev.filter(p => p.id !== photo.id));
      toast.success(s("Foto eliminada", "Photo deleted"));
    }
  }

  async function createComparison() {
    if (selected.length !== 2) return;
    const res = await fetch("/api/progress/comparisons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, photo_before_id: selected[0].id, photo_after_id: selected[1].id }),
    });
    if (res.ok) {
      toast.success(s("Comparación guardada", "Comparison saved"));
      setSelected([]);
      setMode("comparisons");
      load();
    } else {
      toast.error(s("Error al guardar", "Save error"));
    }
  }

  async function toggleShareComparison(comp: Comparison) {
    const res = await fetch("/api/progress/comparisons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comp.id, shared_with_client: !comp.shared_with_client }),
    });
    if (res.ok) {
      setComparisons(prev => prev.map(c => c.id === comp.id ? { ...c, shared_with_client: !c.shared_with_client } : c));
      toast.success(comp.shared_with_client ? s("Comparación ocultada", "Comparison hidden") : s("Comparación compartida", "Comparison shared"));
    }
  }

  async function deleteComparison(comp: Comparison) {
    if (!confirm(s("¿Eliminar esta comparación?", "Delete this comparison?"))) return;
    const res = await fetch("/api/progress/comparisons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comp.id }),
    });
    if (res.ok) {
      setComparisons(prev => prev.filter(c => c.id !== comp.id));
      toast.success(s("Comparación eliminada", "Comparison deleted"));
    }
  }

  function toggleSelect(photo: Photo) {
    setSelected(prev => {
      if (prev.find(p => p.id === photo.id)) return prev.filter(p => p.id !== photo.id);
      if (prev.length >= 2) return prev;
      return [...prev, photo];
    });
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  if (loading) return <p className="text-sm text-muted-foreground py-4 text-center">{s("Cargando fotos...", "Loading photos...")}</p>;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={mode === "gallery" ? "default" : "outline"} onClick={() => { setMode("gallery"); setSelected([]); }}>
          {s("Galería", "Gallery")} {photos.length > 0 && <Badge className="ml-1 text-xs" variant="secondary">{photos.length}</Badge>}
        </Button>
        <Button size="sm" variant={mode === "compare" ? "default" : "outline"} onClick={() => { setMode("compare"); setSelected([]); }}>
          <GitCompare className="h-3.5 w-3.5 mr-1" />{s("Comparar", "Compare")}
        </Button>
        <Button size="sm" variant={mode === "comparisons" ? "default" : "outline"} onClick={() => { setMode("comparisons"); setSelected([]); }}>
          {s("Comparaciones", "Comparisons")} {comparisons.length > 0 && <Badge className="ml-1 text-xs" variant="secondary">{comparisons.length}</Badge>}
        </Button>
      </div>

      {/* Upload bar */}
      {mode === "gallery" && (
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={takenAt} onChange={e => setTakenAt(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background" />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {uploading ? s("Subiendo...", "Uploading...") : s("Subir foto(s)", "Upload photo(s)")}
          </Button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} />
        </div>
      )}

      {/* GALLERY MODE */}
      {mode === "gallery" && (
        <>
          {photos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{s("Todavía no hay fotos de progreso", "No progress photos yet")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-square">
                  <img src={photo.url} alt={formatDate(photo.taken_at)} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => toggleShare(photo)} title={photo.shared_with_client ? s("Ocultar al cliente", "Hide from client") : s("Compartir con cliente", "Share with client")}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white">
                        {photo.shared_with_client ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => deletePhoto(photo)} className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/70 text-white">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">{formatDate(photo.taken_at)}</p>
                      {photo.note && <p className="text-xs text-white/80 truncate">{photo.note}</p>}
                      {photo.shared_with_client && <Badge className="text-xs mt-1 bg-green-500/80 text-white border-0">{s("Compartida", "Shared")}</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COMPARE MODE */}
      {mode === "compare" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {s("Seleccioná 2 fotos para comparar", "Select 2 photos to compare")}
            {selected.length > 0 && ` (${selected.length}/2 ${s("seleccionadas", "selected")})`}
          </p>

          {selected.length === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {selected.map((p, i) => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border-2 border-[#A3E635] aspect-square">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[#A3E635] text-[#111827] text-xs font-bold px-2 py-0.5 rounded-full">
                      {i === 0 ? s("Antes", "Before") : s("Después", "After")}
                    </div>
                    <button onClick={() => setSelected(prev => prev.filter(sp => sp.id !== p.id))}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white">
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-1.5 py-0.5 rounded">
                      {formatDate(p.taken_at)}
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={createComparison} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />{s("Guardar comparación", "Save comparison")}
              </Button>
            </div>
          )}

          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{s("No hay fotos disponibles", "No photos available")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map(photo => {
                const isSelected = !!selected.find(p => p.id === photo.id);
                const disabled = !isSelected && selected.length >= 2;
                return (
                  <button key={photo.id} onClick={() => !disabled && toggleSelect(photo)}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${isSelected ? "border-[#A3E635]" : disabled ? "border-border opacity-40 cursor-not-allowed" : "border-border hover:border-[#A3E635]/50"}`}>
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-[#A3E635] text-[#111827] text-xs font-bold px-2 py-0.5 rounded-full">
                        {selected.findIndex(p => p.id === photo.id) === 0 ? s("Antes", "Before") : s("Después", "After")}
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-1.5 py-0.5 rounded">
                      {formatDate(photo.taken_at)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COMPARISONS MODE */}
      {mode === "comparisons" && (
        <div className="space-y-4">
          {comparisons.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{s("No hay comparaciones guardadas", "No saved comparisons")}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setMode("compare")}>
                {s("Crear primera comparación", "Create first comparison")}
              </Button>
            </div>
          ) : (
            comparisons.map(comp => (
              <div key={comp.id} className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 gap-0">
                  <div className="relative aspect-square">
                    <img src={comp.before.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {s("Antes", "Before")} · {formatDate(comp.before.taken_at)}
                    </div>
                  </div>
                  <div className="relative aspect-square">
                    <img src={comp.after.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[#A3E635] text-[#111827] text-xs font-bold px-2 py-0.5 rounded-full">
                      {s("Después", "After")} · {formatDate(comp.after.taken_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                  <div className="flex items-center gap-2">
                    {comp.shared_with_client
                      ? <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-0 text-xs">{s("Compartida con cliente", "Shared with client")}</Badge>
                      : <Badge variant="secondary" className="text-xs">{s("Solo entrenador", "Trainer only")}</Badge>
                    }
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => toggleShareComparison(comp)}>
                      <Share2 className="h-3 w-3" />
                      {comp.shared_with_client ? s("Ocultar", "Hide") : s("Compartir", "Share")}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => deleteComparison(comp)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
