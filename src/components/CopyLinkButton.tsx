"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopyLinkButton({ link }: { link: string }) {
  function copy() {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs text-indigo-600 hover:underline"
    >
      <Copy className="h-3 w-3" /> Copiar link
    </button>
  );
}
