import { headers } from "next/headers";
import type { Lang } from "./translations";

export async function getLanguageFromRequest(): Promise<Lang> {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    return acceptLanguage.toLowerCase().startsWith("en") ? "en" : "es";
  } catch {
    return "es";
  }
}

export async function getLanguageFromCookie(): Promise<Lang | null> {
  try {
    const headersList = await headers();
    const cookies = headersList.get("cookie") || "";
    const match = cookies.match(/fitcoach-lang=(es|en)/);
    return match ? (match[1] as Lang) : null;
  } catch {
    return null;
  }
}

export async function detectInitialLanguage(): Promise<Lang> {
  const cookieLang = await getLanguageFromCookie();
  if (cookieLang) return cookieLang;
  return await getLanguageFromRequest();
}

export function getLanguageFromRequestSync(acceptLanguageHeader: string | null): Lang {
  if (!acceptLanguageHeader) return "es";
  return acceptLanguageHeader.toLowerCase().startsWith("en") ? "en" : "es";
}
