"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Settings,
  LogOut,
  Shield,
  Bell,
  Moon,
  User,
  Mail,
  AlertTriangle,
} from "lucide-react"
import type { Client } from "@/lib/types/database"

interface SettingsClientProps {
  client: Client | null
  userEmail: string
  isDemo?: boolean
}

export function SettingsClient({ client, userEmail, isDemo }: SettingsClientProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

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
