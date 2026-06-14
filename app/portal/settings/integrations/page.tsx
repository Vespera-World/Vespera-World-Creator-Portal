"use client"

import { ChatWootConnect } from "@/components/integrations/chatwoot-connect"

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

      <ChatWootConnect />
    </div>
  )
}
