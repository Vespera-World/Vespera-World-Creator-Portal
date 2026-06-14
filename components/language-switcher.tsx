"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { useTolgee } from "@/lib/tolgee-client"

export function LanguageSwitcher() {
  const { currentLang, changeLanguage, languages } = useTolgee()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase text-xs font-medium">{currentLang}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 glass-card border border-border/20 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/20 transition-colors flex items-center gap-2 ${
                currentLang === lang.code ? "text-gold font-medium" : "text-muted-foreground"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
