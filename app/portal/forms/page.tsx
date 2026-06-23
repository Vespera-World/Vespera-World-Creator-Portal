import { createClient } from "@/lib/supabase/server"
import { FormsClient } from "./forms-client"
import type { CreatorFormDoc, CreatorPortalUser } from "@/lib/types/database"

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <FormsClient formsDocs={[]} clientId="" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return <FormsClient formsDocs={[]} clientId="" isDemo />
  }

  const { data: formsDocs } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  return <FormsClient formsDocs={formsDocs || []} clientId={portalUser.creator_id} />
}
