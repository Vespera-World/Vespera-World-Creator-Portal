'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'vespera-link-lust-mode'

export function LustModeToggle() {
  const [lustMode, setLustMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setLustMode(true)
  }, [])

  const toggle = () => {
    const next = !lustMode
    setLustMode(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    // Notify other components on the page
    window.dispatchEvent(new CustomEvent('vespera-lust-mode', { detail: next }))
  }

  if (!mounted) {
    // Render placeholder to avoid hydration mismatch
    return (
      <button
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur border border-border/50 opacity-50"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className={`fixed top-4 right-4 z-50 group flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur border transition-all ${
        lustMode
          ? 'bg-gradient-to-r from-pink-900/80 to-red-900/80 border-pink-500/50 text-pink-100 shadow-lg shadow-pink-500/30'
          : 'bg-background/80 border-border/50 text-foreground hover:border-primary/50'
      }`}
      aria-label={lustMode ? 'Switch to light mode' : 'Switch to lust mode'}
      title={lustMode ? 'Switch to light mode' : 'Enter Lust Mode 🔥'}
    >
      {lustMode ? (
        <>
          <Moon className="h-4 w-4 animate-pulse" />
          <span className="text-xs font-medium hidden sm:inline">Lust Mode</span>
          <Sparkles className="h-3 w-3 text-pink-300" />
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Light</span>
        </>
      )}
    </button>
  )
}

// Hook for components to react to lust mode changes
export function useLustMode(): [boolean, (next: boolean) => void] {
  const [lustMode, setLustMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setLustMode(true)

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setLustMode(detail)
    }
    window.addEventListener('vespera-lust-mode', handler)
    return () => window.removeEventListener('vespera-lust-mode', handler)
  }, [])

  const set = (next: boolean) => {
    setLustMode(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    window.dispatchEvent(new CustomEvent('vespera-lust-mode', { detail: next }))
  }

  return [mounted && lustMode, set]
}