import { Tolgee, InContextTools, FormatSimple, BackendFetch } from "@tolgee/web"
import { useEffect, useState } from "react"

// Tolgee config — NEVER expose this key in production
// For dev: fine to use. For prod: restrict key or remove InContextTools.
const TOLGEE_API_KEY = process.env.NEXT_PUBLIC_TOLGEE_API_KEY || ""
const TOLGEE_API_URL = process.env.NEXT_PUBLIC_TOLGEE_API_URL || ""

export const tolgee = Tolgee()
  .use(InContextTools())
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    tolgee.run().then(() => setReady(true))
    return () => {
      tolgee.stop()
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    )
  }

  return <>{children}</>
}

export async function changeLanguage(lang: string) {
  await tolgee.changeLanguage(lang)
}

export function useTolgee() {
  const [lang, setLang] = useState("en")

  const switchLang = async (newLang: string) => {
    await changeLanguage(newLang)
    setLang(newLang)
    document.documentElement.lang = newLang
  }

  return { lang, switchLang, languages: ["en", "es", "pt"] }
}
