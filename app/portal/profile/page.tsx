import { createClient } from "@/lib/supabase/server"
import { ProfileClient } from "./profile-client"
import type { Client, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
}

interface CreatorSocialLink {
  id: string
  platform: string
  platform_url: string
  follower_count: number | null
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <ProfileClient client={demoClient} userEmail="demo@vesperaworld.com" socials={[]} isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <ProfileClient client={demoClient} userEmail={user.email || ''} socials={[]} isDemo />
  }

  // Fetch creator profile
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  // Fetch social links for this creator
  let socials: CreatorSocialLink[] = []
  if (client?.id) {
    const { data: socialData } = await supabase
      .from("creator_social_links")
      .select("id, platform, platform_url, Follower_Count")
      .eq("creator_id", client.id)
      .order("Follower_Count", { ascending: false, nullsFirst: false })
    socials = (socialData || []) as CreatorSocialLink[]
  }

  return <ProfileClient client={client} userEmail={user.email || ''} socials={socials} />
}