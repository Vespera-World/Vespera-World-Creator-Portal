'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import type { CreatorPortalUser } from '@/lib/types/database'

interface AuthState {
  user: User | null
  session: Session | null
  portalUser: CreatorPortalUser | null
  isLoading: boolean
  isAdmin: boolean
  isManager: boolean
  isCreator: boolean
  error: Error | null
}

export function useAuthUser() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    portalUser: null,
    isLoading: true,
    isAdmin: false,
    isManager: false,
    isCreator: false,
    error: null,
  })

  const supabase = createClient()

  const refreshAuth = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError

      if (!user) {
        setState({
          user: null,
          session: null,
          portalUser: null,
          isLoading: false,
          isAdmin: false,
          isManager: false,
          isCreator: false,
          error: null,
        })
        return
      }

      // Fetch portal user data
      const { data: portalUser, error: portalError } = await supabase
        .from('creator_portal_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (portalError && portalError.code !== 'PGRST116') {
        console.warn('Portal user fetch error:', portalError)
      }

      const role = portalUser?.role || 'creator'

      setState({
        user,
        session: null, // Fetch separately if needed
        portalUser: portalUser || null,
        isLoading: false,
        isAdmin: role === 'admin',
        isManager: role === 'manager',
        isCreator: role === 'creator' || role === 'admin' || role === 'manager',
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Auth refresh failed'),
      }))
    }
  }, [supabase])

  useEffect(() => {
    refreshAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        refreshAuth()
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          session: null,
          portalUser: null,
          isLoading: false,
          isAdmin: false,
          isManager: false,
          isCreator: false,
          error: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshAuth])

  return {
    ...state,
    refreshAuth,
  }
}

// Lightweight hook for client-side auth checks
export function useAuthCheck() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
      setIsLoading(false)
    })
  }, [supabase])

  return { isAuthenticated, isLoading }
}
