'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CreatorPortalUser } from '@/lib/types/database'
import { SocialLoginButtons } from '@/components/auth/social-login-buttons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      
      // Get user role from creator_portal_users table
      if (authData.user) {
        const { data: portalUser } = await supabase
          .from('creator_portal_users')
          .select('role')
          .eq('auth_user_id', authData.user.id)
          .single() as { data: Pick<CreatorPortalUser, 'role'> | null }
        
        // Route based on role (default to creator portal)
        if (portalUser?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/portal')
        }
      } else {
        router.push('/portal')
      }
      
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/vespera-logo.png"
              alt="Vespera World"
              width={80}
              height={80}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold gradient-gold">Creator Portal</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in to manage your content
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-vespera"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-vespera"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-gold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-4 space-y-3">
            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground uppercase tracking-widest">or continue with</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <SocialLoginButtons />
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Contact your manager
              </Link>
            </p>
          </div>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by Vespera World
        </p>
      </div>
    </div>
  )
}
