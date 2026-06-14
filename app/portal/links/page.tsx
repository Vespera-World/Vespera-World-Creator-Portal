import { createClient } from "@/lib/supabase/server"
import { LinksClient } from "./links-client"
import type { LinkHubLink, Client, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  link_hub_slug: 'democreator',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
}

const demoLinks: LinkHubLink[] = [
  { id: '1', client_id: 'demo', title: 'YouTube Channel', url: 'https://youtube.com/@democreator', icon: 'youtube', position: 1, is_active: true, created_at: new Date().toISOString() },
  { id: '2', client_id: 'demo', title: 'Instagram', url: 'https://instagram.com/democreator', icon: 'instagram', position: 2, is_active: true, created_at: new Date().toISOString() },
  { id: '3', client_id: 'demo', title: 'TikTok', url: 'https://tiktok.com/@democreator', icon: 'tiktok', position: 3, is_active: true, created_at: new Date().toISOString() },
  { id: '4', client_id: 'demo', title: 'Merch Store', url: 'https://store.democreator.com', icon: 'shopping-bag', position: 4, is_active: false, created_at: new Date().toISOString() },
]

export default async function LinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <LinksClient links={demoLinks} client={demoClient} isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <LinksClient links={demoLinks} client={demoClient} isDemo />
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  const { data: links } = await supabase
    .from("link_hub_links")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("position", { ascending: true }) as { data: LinkHubLink[] | null }

  return <LinksClient links={links || []} client={client} />
}
