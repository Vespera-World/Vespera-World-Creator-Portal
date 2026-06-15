import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminContentClient } from "./content-client"
import type { CreatorFile, Client, CreatorPortalUser, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

export default async function AdminContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser || (portalUser.role !== 'admin' && portalUser.role !== 'manager')) {
    redirect("/portal")
  }

  // Fetch all creators
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .order("name") as { data: Client[] | null }

  // Fetch all files
  const { data: files } = await supabase
    .from("creator_files")
    .select("*")
    .order("created_at", { ascending: false }) as { data: CreatorFile[] | null }

  // Fetch all marketplace items
  const { data: marketplaceItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false }) as { data: MarketplaceItem[] | null }

  // Fetch all social media content
  const { data: socialContent } = await supabase
    .from("social_media_content")
    .select("*")
    .order("created_at", { ascending: false }) as { data: SocialMediaContent[] | null }

  // Join files with creators
  const filesWithClients = (files || []).map(file => ({
    ...file,
    client: (creators || []).find(c => c.id === file.creator_id)
  }))

  // Join marketplace items with creators
  const marketplaceWithClients = (marketplaceItems || []).map(item => ({
    ...item,
    client: (creators || []).find(c => c.id === item.creator_id)
  }))

  // Join social content with creators
  const socialWithClients = (socialContent || []).map(content => ({
    ...content,
    client: (creators || []).find(c => c.id === content.creator_id)
  }))

  return (
    <AdminContentClient
      files={filesWithClients}
      marketplaceItems={marketplaceWithClients}
      socialContent={socialWithClients}
      clients={creators || []}
    />
  )
}
