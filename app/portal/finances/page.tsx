import { createClient } from "@/lib/supabase/server"
import { FinancesClient } from "./finances-client"
import type { Transaction, Client, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo', name: 'Demo Creator', email: 'demo@vesperaworld.com', status: 'active',
  created_at: new Date().toISOString(), updated_at: new Date().toISOString()
}

const demoTransactions: Transaction[] = [
  { id: '1', client_id: 'demo', type: 'revenue', amount: 2500, description: 'Brand Partnership - Nike', category: 'sponsorship', transaction_date: new Date(Date.now() - 86400000 * 2).toISOString(), created_at: new Date().toISOString() },
  { id: '2', client_id: 'demo', type: 'revenue', amount: 1200, description: 'YouTube AdSense', category: 'ads', transaction_date: new Date(Date.now() - 86400000 * 5).toISOString(), created_at: new Date().toISOString() },
  { id: '3', client_id: 'demo', type: 'expense', amount: 350, description: 'Equipment rental', category: 'production', transaction_date: new Date(Date.now() - 86400000 * 7).toISOString(), created_at: new Date().toISOString() },
  { id: '4', client_id: 'demo', type: 'revenue', amount: 800, description: 'Affiliate commission', category: 'affiliate', transaction_date: new Date(Date.now() - 86400000 * 10).toISOString(), created_at: new Date().toISOString() },
  { id: '5', client_id: 'demo', type: 'revenue', amount: 3200, description: 'Brand deal - Spotify', category: 'sponsorship', transaction_date: new Date(Date.now() - 86400000 * 14).toISOString(), created_at: new Date().toISOString() },
]

export default async function FinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <FinancesClient transactions={demoTransactions} client={demoClient} isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <FinancesClient transactions={demoTransactions} client={demoClient} isDemo />
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("transaction_date", { ascending: false }) as { data: Transaction[] | null }

  return <FinancesClient transactions={transactions || []} client={client} />
}
