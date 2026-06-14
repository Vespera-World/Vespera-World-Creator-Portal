import { createBrowserClient } from '@supabase/ssr'

// Cookie domain for cross-subdomain SSO
// In production, cookies are scoped to `.vesperaworld.com` (vesperaworld.com, link.*, platform.*).
const getCookieDomain = () => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('vesperaworld.com')) {
    return '.vesperaworld.com'
  }
  return undefined // Use default (current domain) in development
}

export function createClient() {
  const cookieDomain = getCookieDomain()

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Configure cookie domain for cross-subdomain SSO
        ...(cookieDomain && {
          domain: cookieDomain,
        }),
      },
    },
  )
}
