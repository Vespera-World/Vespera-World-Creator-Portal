import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "./dashboard-client"
import type { Client, ClientTask, Transaction } from "@/lib/types/database"

// Demo data for unauthenticated access
const DEMO_CREATORS: Client[] = [
  {
    id: "demo-1",
    name: "Star",
    display_name: "Star Luna",
    email: "star@vesperaworld.com",
    status: "active",
    monthly_revenue: 24750,
    revenue_change: 12.5,
    subscribers: 15400,
    platform: "OnlyFans",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    avatar: null,
    join_date: null,
    bio: null,
    vespera_slug: "star-luna",
  },
  {
    id: "demo-2",
    name: "Nova",
    display_name: "Nova Skye",
    email: "nova@vesperaworld.com",
    status: "active",
    monthly_revenue: 18200,
    revenue_change: 8.3,
    subscribers: 12800,
    platform: "Fansly",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    avatar: null,
    join_date: null,
    bio: null,
    vespera_slug: "nova-skye",
  },
  {
    id: "demo-3",
    name: "Ember",
    display_name: "Ember Rose",
    email: "ember@vesperaworld.com",
    status: "active",
    monthly_revenue: 31500,
    revenue_change: 22.1,
    subscribers: 21000,
    platform: "OnlyFans",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    avatar: null,
    join_date: null,
    bio: null,
    vespera_slug: "ember-rose",
  },
  {
    id: "demo-4",
    name: "Luna",
    display_name: "Luna Midnight",
    email: "luna@vesperaworld.com",
    status: "active",
    monthly_revenue: 14300,
    revenue_change: -3.2,
    subscribers: 9500,
    platform: "Fansly",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: null,
    avatar: null,
    join_date: null,
    bio: null,
    vespera_slug: "luna-midnight",
  },
]

const DEMO_TASKS: (ClientTask & { creator_name: string })[] = [
  { id: "1", client_id: "demo-1", title: "Complete profile setup", description: null, status: "pending", priority: "high", due_date: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null, creator_name: "Star Luna" },
  { id: "2", client_id: "demo-2", title: "Review content calendar", description: null, status: "in_progress", priority: "medium", due_date: new Date(Date.now() + 172800000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null, creator_name: "Nova Skye" },
  { id: "3", client_id: "demo-3", title: "Sign contractor agreement", description: null, status: "pending", priority: "high", due_date: new Date(Date.now() + 259200000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null, creator_name: "Ember Rose" },
  { id: "4", client_id: "demo-1", title: "Upload tax documents", description: null, status: "pending", priority: "medium", due_date: new Date(Date.now() + 345600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null, creator_name: "Star Luna" },
]

const DEMO_TRANSACTIONS: (Transaction & { creator_name: string })[] = [
  { id: "1", client_id: "demo-1", type: "income", amount: 4250, description: "OnlyFans payout - May", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: "platform", vendor_id: null, region: null, payment_method: null, creator_name: "Star Luna" },
  { id: "2", client_id: "demo-3", type: "income", amount: 6200, description: "OnlyFans payout - May", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: "platform", vendor_id: null, region: null, payment_method: null, creator_name: "Ember Rose" },
  { id: "3", client_id: "demo-2", type: "income", amount: 3100, description: "Fansly payout - May", transaction_date: new Date(Date.now() - 172800000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: "platform", vendor_id: null, region: null, payment_method: null, creator_name: "Nova Skye" },
  { id: "4", client_id: "demo-1", type: "expense", amount: 350, description: "Content production", transaction_date: new Date(Date.now() - 259200000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: "production", vendor_id: null, region: null, payment_method: null, creator_name: "Star Luna" },
  { id: "5", client_id: "demo-4", type: "income", amount: 2800, description: "Fansly payout - May", transaction_date: new Date(Date.now() - 345600000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), category: "platform", vendor_id: null, region: null, payment_method: null, creator_name: "Luna Midnight" },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get user — gracefully handle no session (demo mode)
  const { data: { user } } = await supabase.auth.getUser()

  // DEMO MODE: no auth required
  if (!user) {
    const totalRevenue = DEMO_CREATORS.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0)
    const totalSubscribers = DEMO_CREATORS.reduce((sum, c) => sum + (c.subscribers || 0), 0)
    const avgRevenueChange = DEMO_CREATORS.reduce((sum, c) => sum + (c.revenue_change || 0), 0) / DEMO_CREATORS.length
    
    return (
      <AdminDashboardClient
        creators={DEMO_CREATORS}
        tasks={DEMO_TASKS}
        transactions={DEMO_TRANSACTIONS}
        stats={{
          totalCreators: DEMO_CREATORS.length,
          totalRevenue,
          totalSubscribers,
          pendingTasks: DEMO_TASKS.filter(t => t.status === 'pending').length,
          avgRevenueChange,
        }}
        isDemo={true}
      />
    )
  }

  // Fetch all active creators
  const { data: creators } = await supabase
    .from("clients")
    .select("*")
    .eq("status", "active")
    .order("monthly_revenue", { ascending: false }) as { data: Client[] | null }

  // Fetch all pending tasks with client info
  const { data: tasksRaw } = await supabase
    .from("client_tasks")
    .select("*, clients(name, display_name)")
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(10)

  const tasks = (tasksRaw || []).map((t: ClientTask & { clients: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.clients?.display_name || t.clients?.name || 'Unknown'
  }))

  // Fetch recent transactions with client info
  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("*, clients(name, display_name)")
    .order("transaction_date", { ascending: false })
    .limit(10)

  const transactions = (transactionsRaw || []).map((t: Transaction & { clients: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.clients?.display_name || t.clients?.name || 'Unknown'
  }))

  // Calculate combined stats
  const totalRevenue = (creators || []).reduce((sum, c) => sum + (c.monthly_revenue || 0), 0)
  const totalSubscribers = (creators || []).reduce((sum, c) => sum + (c.subscribers || 0), 0)
  const avgRevenueChange = (creators || []).length > 0
    ? (creators || []).reduce((sum, c) => sum + (c.revenue_change || 0), 0) / (creators || []).length
    : 0

  return (
    <AdminDashboardClient
      creators={creators || []}
      tasks={tasks}
      transactions={transactions}
      stats={{
        totalCreators: (creators || []).length,
        totalRevenue,
        totalSubscribers,
        pendingTasks: tasks.length,
        avgRevenueChange,
      }}
    />
  )
}
