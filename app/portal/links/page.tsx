import { createClient } from "@/lib/supabase/server"
import { LinksClient } from "./links-client"
import type { LinkHubLink, Creator, CreatorPortalUser } from "@/lib/types/database"

export default async function LinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <LinksClient links={[]} creator={null} isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return <LinksClient links={[]} creator={null} isDemo />
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", portalUser.creator_id)
    .single() as { data: Creator | null }

  const { data: links } = await supabase
    .from("link_hub_links")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("sort_order", { ascending: true }) as { data: LinkHubLink[] | null }

  return <LinksClient links={links || []} creator={creator} />
}
