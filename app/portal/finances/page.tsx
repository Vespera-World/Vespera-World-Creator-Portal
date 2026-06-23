import { createClient } from "@/lib/supabase/server"
import { FinancesClient } from "./finances-client"
import type { Transaction, Creator, CreatorPortalUser } from "@/lib/types/database"

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <FinancesClient transactions={[]} client={null} isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return <FinancesClient transactions={[]} client={null} isDemo />
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", portalUser.creator_id)
    .single() as { data: Creator | null }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("transaction_date", { ascending: false }) as { data: Transaction[] | null }

  return <FinancesClient transactions={transactions || []} client={creator} />
}
