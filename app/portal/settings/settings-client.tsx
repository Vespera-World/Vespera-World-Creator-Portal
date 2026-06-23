"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Settings,
  LogOut,
  Shield,
  Bell,
  Moon,
  User,
  Mail,
  AlertTriangle,
  Banknote,
  CreditCard,
  Building2,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import type { Client } from "@/lib/types/database"

interface SettingsClientProps {
  client: Client | null
  userEmail: string
  isDemo?: boolean
}

// Mask an account number: show ****1234 if length > 4
function maskAccount(num: string | null | undefined): string {
  if (!num) return ""
  if (num.length <= 4) return num
  return `****${num.slice(-4)}`
}

// Validate email format (basic)
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export function SettingsClient({ client, userEmail, isDemo }: SettingsClientProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isSavingDeposit, setIsSavingDeposit] = useState(false)
  const [depositSaved, setDepositSaved] = useState(false)

  // Deposit Info state — initialize from client prop
  const [bankName, setBankName] = useState(client?.bank_name || "")
  const [bankAccountNumber, setBankAccountNumber] = useState(client?.bank_account_number || "")
  const [bankRoutingNumber, setBankRoutingNumber] = useState(client?.bank_routing_number || "")
  const [paypalEmail, setPaypalEmail] = useState(client?.paypal_email || "")
  const [cashappHandle, setCashappHandle] = useState(client?.cashapp_handle || "")

  // Track if values are dirty (changed from initial)
  const [initialDeposit, setInitialDeposit] = useState({
    bank_name: client?.bank_name || "",
    bank_account_number: client?.bank_account_number || "",
    bank_routing_number: client?.bank_routing_number || "",
    paypal_email: client?.paypal_email || "",
    cashapp_handle: client?.cashapp_handle || "",
  })

  // Reset saved indicator when user starts typing again
  useEffect(() => {
    setDepositSaved(false)
  }, [bankName, bankAccountNumber, bankRoutingNumber, paypalEmail, cashappHandle])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!bankName.trim()) {
      toast.error("Bank name is required")
      return
    }
    if (!bankAccountNumber.trim()) {
      toast.error("Bank account number is required")
      return
    }
    if (bankAccountNumber.length < 4) {
      toast.error("Bank account number must be at least 4 digits")
      return
    }
    if (paypalEmail.trim() && !isValidEmail(paypalEmail)) {
      toast.error("PayPal email is not a valid email address")
      return
    }

    if (isDemo) {
      toast.error("Demo mode — sign in to save")
      return
    }

    if (!client?.id) {
      toast.error("Could not identify your creator profile")
      return
    }

    setIsSavingDeposit(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('creators')
        .update({
          bank_name: bankName.trim(),
          bank_account_number: bankAccountNumber.trim(),
          bank_routing_number: bankRoutingNumber.trim() || null,
          paypal_email: paypalEmail.trim() || null,
          cashapp_handle: cashappHandle.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id)

      if (error) throw error

      // Update initial snapshot so we can detect future changes
      setInitialDeposit({
        bank_name: bankName.trim(),
        bank_account_number: bankAccountNumber.trim(),
        bank_routing_number: bankRoutingNumber.trim(),
        paypal_email: paypalEmail.trim(),
        cashapp_handle: cashappHandle.trim(),
      })
      setDepositSaved(true)
      toast.success('Deposit info saved')
    } catch (e: any) {
      console.error('Save deposit info error:', e)
      toast.error(e?.message || 'Failed to save deposit info')
    } finally {
      setIsSavingDeposit(false)
    }
  }

  const depositIsDirty =
    bankName !== initialDeposit.bank_name ||
    bankAccountNumber !== initialDeposit.bank_account_number ||
    bankRoutingNumber !== initialDeposit.bank_routing_number ||
    paypalEmail !== initialDeposit.paypal_email ||
    cashappHandle !== initialDeposit.cashapp_handle

  // Display masked account number
  const displayAccountNumber = bankAccountNumber && bankAccountNumber !== initialDeposit.bank_account_number
    ? bankAccountNumber // user is typing, show raw
    : maskAccount(bankAccountNumber)

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-purple">Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings.
        </p>
      </div>

      {/* Account Info */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gold" />
          Account Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{userEmail}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Display Name</p>
                <p className="font-medium">{client?.display_name || client?.name || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Info — NEW SECTION */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-gold" />
          Deposit Info
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Where we send your payouts. All fields are encrypted at rest.
        </p>

        <form onSubmit={handleSaveDeposit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank-name" className="text-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gold" />
                Bank Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank-name"
                type="text"
                placeholder="Chase Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="input-vespera"
                maxLength={100}
                required
                disabled={isDemo}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-account" className="text-foreground flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-gold" />
                Bank Account # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bank-account"
                type="text"
                inputMode="numeric"
                placeholder="1234567890123"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="input-vespera font-mono"
                maxLength={34}
                required
                disabled={isDemo}
              />
              {initialDeposit.bank_account_number && (
                <p className="text-xs text-muted-foreground">
                  Stored as: <span className="font-mono">{maskAccount(initialDeposit.bank_account_number)}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-routing" className="text-foreground">
                Bank Routing #
              </Label>
              <Input
                id="bank-routing"
                type="text"
                inputMode="numeric"
                placeholder="021000021"
                value={bankRoutingNumber}
                onChange={(e) => setBankRoutingNumber(e.target.value.replace(/\D/g, ''))}
                className="input-vespera font-mono"
                maxLength={20}
                disabled={isDemo}
              />
              <p className="text-xs text-muted-foreground">
                For US: ABA routing (9 digits). For Mexico: CLABE (18 digits).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypal-email" className="text-foreground">
                PayPal Email
              </Label>
              <Input
                id="paypal-email"
                type="email"
                placeholder="payouts@yourdomain.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="input-vespera"
                maxLength={254}
                disabled={isDemo}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cashapp-handle" className="text-foreground">
                CashApp Handle
              </Label>
              <Input
                id="cashapp-handle"
                type="text"
                placeholder="$yourhandle"
                value={cashappHandle}
                onChange={(e) => setCashappHandle(e.target.value)}
                className="input-vespera"
                maxLength={50}
                disabled={isDemo}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Required for ACH payouts. Other methods are optional.
            </p>
            <Button
              type="submit"
              className="btn-gold"
              disabled={isSavingDeposit || !depositIsDirty || isDemo}
            >
              {isSavingDeposit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : depositSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Deposit Info'
              )}
            </Button>
          </div>

          {isDemo && (
            <p className="text-xs text-muted-foreground italic">
              You're viewing this page in demo mode. Sign in to save changes.
            </p>
          )}
        </form>
      </div>

      {/* Preferences - Coming Soon */}
      <div className="glass-card p-5 opacity-60">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple" />
          Notifications
          <span className="pill-purple ml-2">Coming Soon</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure how you want to receive notifications about tasks, messages, and updates.
        </p>
      </div>

      {/* Appearance - Coming Soon */}
      <div className="glass-card p-5 opacity-60">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Moon className="h-5 w-5 text-gold" />
          Appearance
          <span className="pill-gold ml-2">Coming Soon</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your portal experience.
        </p>
      </div>

      {/* Security */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Security
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account is secured with email and password authentication.
            Contact your manager if you need to reset your password.
          </p>
        </div>
      </div>

      {/* Sign Out */}
      <div className="glass-card p-5 border border-destructive/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sign out of your account. You will need to sign in again to access the portal.
        </p>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}