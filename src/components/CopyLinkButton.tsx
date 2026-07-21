"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/context";

export default function CopyLinkButton({ link }: { link: string }) {
  const { t } = useLanguage();

  function copy() {
    navigator.clipboard.writeText(link);
    toast.success(t("common", "linkCopied"));
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-xs text-indigo-600 hover:underline"
    >
      <Copy className="h-3 w-3" /> {t("common", "copyLink")}
    </button>
  );
}
