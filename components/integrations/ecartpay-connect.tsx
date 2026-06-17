'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreditCard, Link, Loader2, CheckCircle, AlertTriangle, Building2 } from 'lucide-react'

interface EcartPayConnectProps {
  isConnected?: boolean
}

export function EcartPayConnect({ isConnected = false }: EcartPayConnectProps) {
  const [connected, setConnected] = useState(isConnected)
  const [isLoading, setIsLoading] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [secretKey, setSecretKey] = useState('')

  const handleConnect = async () => {
    if (!publicKey || !secretKey) return
    setIsLoading(true)
    // Simulate API call - in production this would save to a credentials vault
    setTimeout(() => {
      setConnected(true)
      setIsLoading(false)
    }, 800)
  }

  const handleDisconnect = () => {
    setConnected(false)
    setPublicKey('')
    setSecretKey('')
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">EcartPay / DeepStrip</h3>
            <p className="text-sm text-muted-foreground">
              Payment processor for adult-friendly payouts and deposits
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
              <span className="text-sm text-muted-foreground">Account</span>
              <span className="text-sm font-medium">vespera_world_prod</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Currency</span>
              <span className="text-sm font-medium">USD / MXN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default split</span>
              <span className="text-sm font-medium">50% agency / 50% creator</span>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs">
              Contact your manager for EcartPay API credentials. Once connected, payouts
              are processed automatically every 14 days.
            </p>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="ecartpay-pub" className="text-sm">Public Key</Label>
            <Input
              id="ecartpay-pub"
              type="text"
              placeholder="pub_..."
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              className="input-vespera font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ecartpay-sec" className="text-sm">Secret Key</Label>
            <Input
              id="ecartpay-sec"
              type="password"
              placeholder="priv_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="input-vespera font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading || !publicKey || !secretKey}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                Connect EcartPay
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function Alert({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 ${className}`}>
      {children}
    </div>
  )
}