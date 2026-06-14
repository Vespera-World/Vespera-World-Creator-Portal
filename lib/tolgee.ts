// Tolgee configuration — run `npm install @tolgee/react` to enable
// Docs: https://tolgee.io/js-sdk/integrations/react/next/app-router

export const TOLGEE_API_URL =
  process.env.NEXT_PUBLIC_TOLGEE_API_URL ||
  "http://tolgee-xxk9o1tlg2mg5qdtd99a2arz.20.228.65.111.sslip.io:8080"

export const TOLGEE_API_KEY = process.env.NEXT_PUBLIC_TOLGEE_API_KEY || ""

// Supported languages for Vespera World (LATAM-first)
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇲🇽" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
]

export const DEFAULT_LANGUAGE = "en"
