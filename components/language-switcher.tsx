"use client"

import { useTolgee } from "@/lib/tolgee"
import { useState, useRef, useEffect } from "react"
import { Globe, Check } from "lucide-react"

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇲🇽" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
]

export function LanguageSwitcher() {
  const { lang, switchLang } = useTolgee()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase font-medium">{lang}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 glass-card border border-border/20 rounded-lg overflow-hidden z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                switchLang(l.code)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/20 transition-colors flex items-center justify-between ${
                lang === l.code
                  ? "text-gold font-medium bg-gold/5"
                  : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </span>
              {lang === l.code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
