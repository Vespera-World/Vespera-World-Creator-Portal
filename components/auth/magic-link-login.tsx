'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

function getRedirectUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  return 'https://agency.vesperaworld.com/auth/callback'
}

export function MagicLinkLogin() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (signInError) throw signInError
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
        <p className="text-sm text-primary font-medium">Magic link sent!</p>
        <p className="text-xs text-muted-foreground mt-1">
          Check {email} for your login link. It expires in 1 hour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="magic-email" className="text-foreground text-sm">
          Email for magic link
        </Label>
        <Input
          id="magic-email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-vespera"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button
        type="submit"
        variant="outline"
        className="w-full border-primary/40 text-primary hover:text-foreground hover:bg-primary/10 bg-transparent"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Magic Link'}
      </Button>
    </form>
  )
}
