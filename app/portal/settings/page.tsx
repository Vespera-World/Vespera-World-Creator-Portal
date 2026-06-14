import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"
import type { Client, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <SettingsClient client={demoClient} userEmail="demo@vesperaworld.com" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  let client: Client | null = null
  if (portalUser) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", portalUser.client_id)
      .single() as { data: Client | null }
    client = data
  }

  return <SettingsClient client={client} userEmail={user.email || ''} />
}
