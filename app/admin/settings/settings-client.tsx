"use client"

import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Building2,
} from "lucide-react"

interface SettingsClientProps {
  isDemo: boolean
  userEmail?: string
}

export function SettingsClient({ isDemo, userEmail }: SettingsClientProps) {
  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 rounded-lg bg-gold/20 border border-gold/30 text-center">
          <p className="text-sm text-gold-light">
            Demo Mode - Settings are view-only in demo mode.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Admin Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your admin account and agency preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Account */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple/10">
              <User className="h-5 w-5 text-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">Manage your admin account details</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{userEmail || 'demo@vesperaworld.com'}</p>
              </div>
              <button className="btn-purple text-sm px-4 py-2" disabled={isDemo}>
                Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
              </div>
              <button className="btn-purple text-sm px-4 py-2" disabled={isDemo}>
                Update
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <span className="pill-warning">Not enabled</span>
            </div>
          </div>
        </div>

        {/* Agency */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gold/10">
              <Building2 className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Agency</h2>
              <p className="text-sm text-muted-foreground">Configure agency-wide settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Agency Name</p>
                <p className="text-sm text-muted-foreground">Vespera World</p>
              </div>
              <button className="btn-purple text-sm px-4 py-2" disabled={isDemo}>
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Default Currency</p>
                <p className="text-sm text-muted-foreground">USD ($)</p>
              </div>
              <button className="btn-purple text-sm px-4 py-2" disabled={isDemo}>
                Change
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Timezone</p>
                <p className="text-sm text-muted-foreground">America/Los_Angeles (PT)</p>
              </div>
              <button className="btn-purple text-sm px-4 py-2" disabled={isDemo}>
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple/10">
              <Bell className="h-5 w-5 text-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure how you receive updates</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email alerts for important events</p>
              </div>
              <span className="pill-success">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Task Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified about pending tasks</p>
              </div>
              <span className="pill-success">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Revenue Alerts</p>
                <p className="text-sm text-muted-foreground">Alerts for significant revenue changes</p>
              </div>
              <span className="pill-warning">Disabled</span>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gold/10">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Data & Privacy</h2>
              <p className="text-sm text-muted-foreground">Manage data and export options</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/20">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-muted-foreground">Download all creator and financial data</p>
              </div>
              <button className="btn-gold text-sm px-4 py-2" disabled={isDemo}>
                Export
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Data Retention</p>
                <p className="text-sm text-muted-foreground">Transaction history stored for 7 years</p>
              </div>
              <span className="pill-purple">Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
