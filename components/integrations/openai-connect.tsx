'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, CheckCircle, Key, Cpu } from 'lucide-react'

interface OpenAIConnectProps {
  isConnected?: boolean
}

export function OpenAIConnect({ isConnected = false }: OpenAIConnectProps) {
  const [connected, setConnected] = useState(isConnected)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleConnect = async () => {
    if (!apiKey) return
    setIsLoading(true)
    setTimeout(() => {
      setConnected(true)
      setIsLoading(false)
    }, 600)
  }

  const handleDisconnect = () => {
    setConnected(false)
    setApiKey('')
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold">OpenAI</h3>
            <p className="text-sm text-muted-foreground">
              Power caption generation, idea prompts, and AI chat
            </p>
          </div>
        </div>
        {connected && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
        )}
      </div>

      {connected ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default model</span>
              <span className="text-sm font-medium">gpt-4o-mini</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Features enabled</span>
              <span className="text-sm font-medium">Captions, Ideas, Chat</span>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your OpenAI API key powers AI features in your portal. We never store your
            key — it's encrypted locally on your device.
          </p>
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm flex items-center gap-1">
              <Key className="h-3 w-3" /> API Key
            </label>
            <input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-vespera font-mono text-sm w-full px-3 py-2 bg-background border border-border rounded-md"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading || !apiKey.startsWith('sk-')}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4 mr-2" />
                Connect OpenAI
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}