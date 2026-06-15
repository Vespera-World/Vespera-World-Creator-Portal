import { createClient } from "@/lib/supabase/server"
import { ContentClient } from "./content-client"
import type { CreatorFile, Creator, CreatorPortalUser, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <ContentClient 
        files={[]} 
        marketplaceItems={[]} 
        socialContent={[]}
        client={null} 
        isDemo 
      />
    )
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return (
      <ContentClient 
        files={[]} 
        marketplaceItems={[]} 
        socialContent={[]}
        client={null} 
        isDemo 
      />
    )
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", portalUser.creator_id)
    .single() as { data: Creator | null }

  const { data: files } = await supabase
    .from("creator_files")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("created_at", { ascending: false }) as { data: CreatorFile[] | null }

  const { data: marketplaceItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("created_at", { ascending: false }) as { data: MarketplaceItem[] | null }

  const { data: socialContent } = await supabase
    .from("social_media_content")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("created_at", { ascending: false }) as { data: SocialMediaContent[] | null }

  return (
    <ContentClient 
      files={files || []} 
      marketplaceItems={marketplaceItems || []}
      socialContent={socialContent || []}
      client={creator} 
      userId={user.id} 
      clientId={portalUser.creator_id} 
    />
  )
}
