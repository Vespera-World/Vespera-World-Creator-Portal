"use client"

import { useState, useCallback } from "react"
import { TOLGEE_API_URL, TOLGEE_API_KEY, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/tolgee"

export function useTolgee() {
  const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE)
  const [isReady, setIsReady] = useState(false)

  const init = useCallback(async () => {
    if (!TOLGEE_API_KEY) {
      console.warn("Tolgee API key not configured")
      setIsReady(false)
      return
    }
    try {
      const res = await fetch(`${TOLGEE_API_URL}/v2/projects/self`, {
        headers: { "X-API-Key": TOLGEE_API_KEY },
      })
      if (res.ok) {
        setIsReady(true)
      }
    } catch (e) {
      console.warn("Tolgee connection failed:", e)
    }
  }, [])

  const changeLanguage = useCallback((lang: string) => {
    setCurrentLang(lang)
    document.documentElement.lang = lang
  }, [])

  return {
    currentLang,
    isReady,
    init,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  }
}
