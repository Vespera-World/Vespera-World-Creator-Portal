'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export function PhoneLogin() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const supabase = createClient()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone,
      })

      if (signInError) throw signInError
      setSent(true)
      setStep('otp')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      })

      if (verifyError) throw verifyError
      // Session set automatically — reload to trigger auth state change
      window.location.href = '/portal'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code')
      setIsLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="otp" className="text-foreground text-sm">
            Verification code sent to {phone}
          </Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-vespera text-center tracking-[0.5em] font-mono"
          />
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full btn-gold"
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify & Login'}
        </Button>
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          Change phone number
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-foreground text-sm">
          Phone number (WhatsApp/SMS)
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 555 123 4567"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-vespera"
        />
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +52 for Mexico, +1 for US)
        </p>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button
        type="submit"
        variant="outline"
        className="w-full border-primary/40 text-primary hover:text-foreground hover:bg-primary/10 bg-transparent"
        disabled={isLoading || sent}
      >
        {sent ? 'Code sent!' : isLoading ? 'Sending...' : 'Send SMS Code'}
      </Button>
    </form>
  )
}
