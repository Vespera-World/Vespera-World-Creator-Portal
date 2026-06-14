"use client"

import { useEffect } from "react"
import { useTolgee } from "@/lib/tolgee-client"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { init } = useTolgee()

  useEffect(() => {
    init()
  }, [init])

  return <>{children}</>
}
