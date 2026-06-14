"use client"

import { useEffect } from "react"
import { tolgee } from "@/lib/tolgee"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    tolgee.run()
    return () => {
      tolgee.stop()
    }
  }, [])

  return <>{children}</>
}
