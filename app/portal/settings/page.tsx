import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"
import type { Creator, CreatorPortalUser } from "@/lib/types/database"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <SettingsClient client={null} userEmail="" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  let creator: Creator | null = null
  if (portalUser?.creator_id) {
    const { data } = await supabase
      .from("creators")
      .select("*")
      .eq("id", portalUser.creator_id)
      .single() as { data: Creator | null }
    creator = data
  }

  return <SettingsClient client={creator} userEmail={user.email || ''} />
}
