"use client"

import { ChatWootConnect } from "@/components/integrations/chatwoot-connect"
import { EcartPayConnect } from "@/components/integrations/ecartpay-connect"
import { OpenAIConnect } from "@/components/integrations/openai-connect"
import { Sparkles } from "lucide-react"

export default function IntegrationsSettingsPage() {
  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-purple">Integrations</span>
        </h1>
        <p className="text-muted-foreground">
          Connect third-party tools to your creator portal
        </p>
      </div>

      {/* Communication */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Communication
        </h2>
        <ChatWootConnect />
      </div>

      {/* Payments */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Payments
        </h2>
        <EcartPayConnect />
      </div>

      {/* AI */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AI & Automation
        </h2>
        <OpenAIConnect />
      </div>

      {/* Footer note */}
      <div className="glass-card p-4 flex items-start gap-3 opacity-70">
        <Sparkles className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Need another integration?</p>
          <p className="text-xs text-muted-foreground">
            Contact your manager. We support Telegram bots, Discord webhooks,
            and custom Zapier-style workflows.
          </p>
        </div>
      </div>
    </div>
  )
}