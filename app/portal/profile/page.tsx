import { createClient } from "@/lib/supabase/server"
import { ProfileClient } from "./profile-client"
import type { Creator, CreatorPortalUser } from "@/lib/types/database"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <ProfileClient client={null} userEmail="" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return <ProfileClient client={null} userEmail={user.email || ''} isDemo />
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", portalUser.creator_id)
    .single() as { data: Creator | null }

  return <ProfileClient client={creator} userEmail={user.email || ''} />
}
