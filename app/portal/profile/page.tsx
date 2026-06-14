import { createClient } from "@/lib/supabase/server"
import { ProfileClient } from "./profile-client"
import type { Client, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  phone: '+1 (555) 123-4567', instagram_handle: '@democreator', tiktok_handle: '@democreator',
  youtube_handle: '@DemoCreator', twitter_handle: '@democreator',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <ProfileClient client={demoClient} userEmail="demo@vesperaworld.com" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <ProfileClient client={demoClient} userEmail="demo@vesperaworld.com" isDemo />
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  return <ProfileClient client={client} userEmail={user.email || ''} />
}
