import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingClient } from './onboarding-client'
import type { Client, CreatorPortalUser } from '@/lib/types/database'

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  country: 'MEX',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <OnboardingClient client={demoClient} isDemo />
  }

  const { data: portalUser } = await supabase
    .from('creator_portal_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <OnboardingClient client={null} isDemo />
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', portalUser.client_id)
    .single() as { data: Client | null }

  return <OnboardingClient client={client} />
}