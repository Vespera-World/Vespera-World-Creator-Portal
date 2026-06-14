"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessageCircle, Link, Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export function ChatWootConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [accountId, setAccountId] = useState("")

  const handleConnect = async () => {
    setIsLoading(true)
    // TODO: Save to integrations table via API
    setTimeout(() => {
      setIsConnected(true)
      setIsLoading(false)
    }, 1000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setApiKey("")
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">ChatWoot</h3>
            <p className="text-sm text-muted-foreground">
              Unified inbox for WhatsApp, Telegram, Instagram DM, Email
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>ChatWoot URL</Label>
            <Input
              placeholder="https://chat.yourdomain.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="input-vespera"
            />
          </div>
          <div className="space-y-2">
            <Label>Account ID</Label>
            <Input
              placeholder="1"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="input-vespera"
            />
          </div>
          <div className="space-y-2">
            <Label>API Access Token</Label>
            <Input
              type="password"
              placeholder="xxxxx..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-vespera"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading || !apiUrl || !apiKey}
            className="w-full btn-gold"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Link className="h-4 w-4 mr-2" />
            )}
            Connect ChatWoot
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-green-400">Active</p>
            </div>
            <Switch checked={true} />
          </div>
          <Button
            variant="outline"
            onClick={handleDisconnect}
            className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      )}
    </div>
  )
}
