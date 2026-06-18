import { Tolgee, FormatSimple, BackendFetch } from "@tolgee/web"
import { useEffect, useState } from "react"

// Tolgee config — NEVER expose this key in production
// DevTools (in-context translation UI) removed: needs CDN that's not reachable
// from local dev. Tolgee core still works for translation lookups.
const TOLGEE_API_KEY = process.env.NEXT_PUBLIC_TOLGEE_API_KEY || ""
const TOLGEE_API_URL = process.env.NEXT_PUBLIC_TOLGEE_API_URL || ""

export const tolgee = Tolgee()
  .use(FormatSimple())
  .use(BackendFetch())
  .init({
    apiKey: TOLGEE_API_KEY,
    apiUrl: TOLGEE_API_URL,
    defaultLanguage: "en",
    observerType: "text",
    observerOptions: { inputPrefix: "{{", inputSuffix: "}}" },
    // Fallback: if Tolgee backend is unreachable, use hardcoded strings
    staticData: {
      en: () => import("@/lib/i18n/en.json"),
      es: () => import("@/lib/i18n/es.json"),
    },
  })

export function TolgeeProvider({ children }: { children: React.ReactNode }) {
  // Render children immediately — don't block on Tolgee server (which we
  // don't have running locally). Translations fall back to staticData en/es.
  return <>{children}</>
}

export async function changeLanguage(lang: string) {
  try {
    await tolgee.changeLanguage(lang)
  } catch {
    // ignore — local fallback handles UI strings
  }
}

export function useTolgee() {
  const [lang, setLang] = useState("en")

  const switchLang = async (newLang: string) => {
    await changeLanguage(newLang)
    setLang(newLang)
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang
    }
  }

  return { lang, switchLang, languages: ["en", "es", "pt"] }
}
