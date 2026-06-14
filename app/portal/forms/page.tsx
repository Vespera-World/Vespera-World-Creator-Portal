import { createClient } from "@/lib/supabase/server"
import { FormsClient } from "./forms-client"
import type { CreatorFormDoc, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoForms: CreatorFormDoc[] = [
  { id: '1', client_id: 'demo', title: 'Independent Contractor Agreement', type: 'contract', status: 'pending', description: 'Required agreement for all creators', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), updated_at: new Date().toISOString() },
  { id: '2', client_id: 'demo', title: 'W-9 Tax Form', type: 'tax', status: 'pending', description: 'US tax documentation', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), updated_at: new Date().toISOString() },
  { id: '3', client_id: 'demo', title: 'Platform Guidelines Acknowledgment', type: 'policy', status: 'completed', description: 'Review and acknowledge platform policies', created_at: new Date(Date.now() - 86400000 * 10).toISOString(), updated_at: new Date(Date.now() - 86400000 * 8).toISOString() },
]

export default async function FormsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <FormsClient formsDocs={demoForms} clientId="demo" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <FormsClient formsDocs={demoForms} clientId="demo" isDemo />
  }

  const { data: formsDocs } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  return <FormsClient formsDocs={formsDocs || []} clientId={portalUser.client_id} />
}
