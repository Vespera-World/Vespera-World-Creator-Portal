import { createBrowserClient } from '@supabase/ssr'

// Cookie domain for cross-subdomain SSO
// In production, cookies are scoped to `.vesperaworld.com` (vesperaworld.com, link.*, platform.*).
const getCookieDomain = (): string | undefined => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vesperaworld.com')) {
    return '.vesperaworld.com'
  }
  return undefined
}

export function createClient() {
  const cookieDomain = getCookieDomain()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map((c) => {
              const eq = c.indexOf('=')
              const name = eq === -1 ? c : c.slice(0, eq)
              const value = eq === -1 ? '' : c.slice(eq + 1)
              return { name, value }
            })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          for (const { name, value, options } of cookiesToSet) {
            let cookie = `${name}=${value}`
            if (cookieDomain || options?.domain) {
              cookie += `; domain=${cookieDomain ?? options!.domain}`
            }
            if (options?.path) cookie += `; path=${options.path}`
            else cookie += `; path=/`
            if (options?.maxAge != null) cookie += `; max-age=${options.maxAge}`
            if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`
            if (options?.sameSite) cookie += `; samesite=${options.sameSite}`
            if (options?.secure) cookie += `; secure`
            document.cookie = cookie
          }
        },
      },
    },
  )
}
