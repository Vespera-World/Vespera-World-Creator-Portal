"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserPlus,
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"

export default function InvitePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          display_name: displayName || name,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          type: "success",
          message: data.message || `Invite sent to ${email}`,
        })
        setEmail("")
        setName("")
        setDisplayName("")
      } else {
        setResult({
          type: "error",
          message: data.error || "Failed to send invite",
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "Network error. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-mesh p-4 lg:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-gold" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold gradient-gold">
              Invite Creator
            </h1>
            <p className="text-muted-foreground">
              Send a magic link to onboard a new creator
            </p>
          </div>
        </div>

        {/* Invite Form */}
        <div className="glass-card p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Creator Name
              </Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 input-vespera"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-foreground">
                Display Name (optional)
              </Label>
              <Input
                id="displayName"
                placeholder="Janeyyy"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-vespera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="creator@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-vespera"
                />
              </div>
            </div>

            {result && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  result.type === "success"
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-destructive/10 border border-destructive/20"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    result.type === "success" ? "text-green-400" : "text-destructive"
                  }`}
                >
                  {result.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-gold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Magic Link Invite
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Instructions */}
        <div className="glass-card p-5 opacity-70">
          <h3 className="text-sm font-semibold mb-2">How it works</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Enter the creator's details</li>
            <li>They receive a magic link email</li>
            <li>Clicking the link auto-creates their account</li>
            <li>They land on the portal dashboard ready to go</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
