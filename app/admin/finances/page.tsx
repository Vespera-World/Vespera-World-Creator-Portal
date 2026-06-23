import { createClient } from "@/lib/supabase/server"
import { FinancesClient } from "./finances-client"
import type { Creator, Transaction } from "@/lib/types/database"

// Demo data
const DEMO_CREATORS: Client[] = [
  { id: "demo-1", name: "Star", display_name: "Star Luna", email: "star@vesperaworld.com", status: "active", monthly_revenue: 24750, revenue_change: 12.5, subscribers: 15400, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-2", name: "Nova", display_name: "Nova Skye", email: "nova@vesperaworld.com", status: "active", monthly_revenue: 18200, revenue_change: 8.3, subscribers: 12800, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-3", name: "Ember", display_name: "Ember Rose", email: "ember@vesperaworld.com", status: "active", monthly_revenue: 31500, revenue_change: 22.1, subscribers: 21000, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-4", name: "Luna", display_name: "Luna Midnight", email: "luna@vesperaworld.com", status: "active", monthly_revenue: 14300, revenue_change: -3.2, subscribers: 9500, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
]

const DEMO_TRANSACTIONS: (Transaction & { creator_name: string })[] = [
  { id: "1", client_id: "demo-1", type: "income", amount: 4250, description: "OnlyFans payout - May", category: "platform", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Star Luna" },
  { id: "2", client_id: "demo-3", type: "income", amount: 6200, description: "OnlyFans payout - May", category: "platform", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Ember Rose" },
  { id: "3", client_id: "demo-2", type: "income", amount: 3100, description: "Fansly payout - May", category: "platform", transaction_date: new Date(Date.now() - 172800000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Nova Skye" },
  { id: "4", client_id: "demo-1", type: "expense", amount: 350, description: "Content production costs", category: "production", transaction_date: new Date(Date.now() - 259200000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Star Luna" },
  { id: "5", client_id: "demo-4", type: "income", amount: 2800, description: "Fansly payout - May", category: "platform", transaction_date: new Date(Date.now() - 345600000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Luna Midnight" },
  { id: "6", client_id: "demo-3", type: "expense", amount: 500, description: "Equipment upgrade", category: "equipment", transaction_date: new Date(Date.now() - 432000000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Ember Rose" },
  { id: "7", client_id: "demo-2", type: "income", amount: 1500, description: "Brand partnership", category: "sponsorship", transaction_date: new Date(Date.now() - 518400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Nova Skye" },
  { id: "8", client_id: "demo-1", type: "income", amount: 3800, description: "OnlyFans payout - April", category: "platform", transaction_date: new Date(Date.now() - 604800000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null, creator_name: "Star Luna" },
]

export default async function AdminFinancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return (
      <FinancesClient
        creators={DEMO_CREATORS}
        transactions={DEMO_TRANSACTIONS}
        isDemo
      />
    )
  }

  // Fetch all active creators
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .eq("status", "active")
    .order("name") as { data: Creator[] | null }

  // Fetch all transactions with creator info
  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("*, creators(name, display_name)")
    .order("transaction_date", { ascending: false })
    .limit(100)

  const transactions = (transactionsRaw || []).map((t: Transaction & { creators: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.clients?.display_name || t.clients?.name || 'Unknown'
  }))

  return (
    <FinancesClient
      creators={creators || []}
      transactions={transactions}
    />
  )
}
