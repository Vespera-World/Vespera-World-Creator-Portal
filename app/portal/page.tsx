import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Client, ClientTask, Transaction, CreatorFormDoc, CreatorPortalUser } from "@/lib/types/database"

// Demo data for unauthenticated access
const DEMO_CLIENT: Client = {
  id: "demo-client-id",
  name: "Star",
  email: "star@vesperaworld.com",
  status: "active",
  monthly_revenue: 24750,
  revenue_change: 12.5,
  created_at: new Date().toISOString(),
  avatar_url: null,
  phone: null,
  platforms: ["OnlyFans", "Fansly"],
  social_links: { instagram: "@star_vespera", twitter: "@starvespera" },
}

const DEMO_TASKS: ClientTask[] = [
  { id: "1", client_id: "demo", title: "Complete profile setup", description: "Add bio and profile photo", status: "pending", priority: "high", due_date: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
  { id: "2", client_id: "demo", title: "Review content calendar", description: "Approve posts for next week", status: "in_progress", priority: "medium", due_date: new Date(Date.now() + 172800000).toISOString(), created_at: new Date().toISOString() },
  { id: "3", client_id: "demo", title: "Sign contractor agreement", description: "Complete onboarding paperwork", status: "pending", priority: "high", due_date: new Date(Date.now() + 259200000).toISOString(), created_at: new Date().toISOString() },
]

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "1", client_id: "demo", type: "revenue", amount: 4250, description: "OnlyFans payout - May", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString() },
  { id: "2", client_id: "demo", type: "revenue", amount: 2180, description: "Fansly payout - May", transaction_date: new Date(Date.now() - 172800000).toISOString(), status: "completed", created_at: new Date().toISOString() },
  { id: "3", client_id: "demo", type: "expense", amount: 350, description: "Content production", transaction_date: new Date(Date.now() - 259200000).toISOString(), status: "completed", created_at: new Date().toISOString() },
  { id: "4", client_id: "demo", type: "revenue", amount: 3800, description: "OnlyFans payout - April", transaction_date: new Date(Date.now() - 604800000).toISOString(), status: "completed", created_at: new Date().toISOString() },
]

const DEMO_FORMS: CreatorFormDoc[] = [
  { id: "1", client_id: "demo", title: "Independent Contractor Agreement", type: "contract", status: "pending", created_at: new Date().toISOString(), form_data: null },
  { id: "2", client_id: "demo", title: "W-9 Tax Form", type: "tax", status: "completed", created_at: new Date(Date.now() - 604800000).toISOString(), form_data: null },
  { id: "3", client_id: "demo", title: "Platform Authorization", type: "authorization", status: "draft", created_at: new Date(Date.now() - 172800000).toISOString(), form_data: null },
]

export default async function PortalDashboardPage() {
  const supabase = await createClient()

  // Get user — gracefully handle no session (demo mode)
  const { data: { user } } = await supabase.auth.getUser()

  // DEMO MODE: no auth required
  if (!user) {
    return (
      <DashboardClient
        client={DEMO_CLIENT}
        tasks={DEMO_TASKS}
        transactions={DEMO_TRANSACTIONS}
        formsDocs={DEMO_FORMS}
        stats={{
          pendingTasks: 3,
          pendingForms: 2,
          monthlyRevenue: 24750,
          revenueChange: 12.5,
        }}
        isDemo={true}
      />
    )
  }

  // Get creator portal user mapping
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Account Not Linked</h2>
          <p className="text-muted-foreground">
            Your account is not linked to a creator profile. Please contact your manager to set up your portal access.
          </p>
        </div>
      </div>
    )
  }

  // Fetch client details
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  // Fetch pending tasks
  const { data: tasks } = await supabase
    .from("client_tasks")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(5) as { data: ClientTask[] | null }

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("transaction_date", { ascending: false })
    .limit(5) as { data: Transaction[] | null }

  // Fetch forms/docs status
  const { data: formsDocs } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  // Calculate stats
  const pendingTasks = tasks?.length || 0
  const pendingForms = formsDocs?.filter(f => f.status === 'pending' || f.status === 'draft').length || 0
  const monthlyRevenue = client?.monthly_revenue || 0
  const revenueChange = client?.revenue_change || 0

  return (
    <DashboardClient
      client={client}
      tasks={tasks || []}
      transactions={transactions || []}
      formsDocs={formsDocs || []}
      stats={{
        pendingTasks,
        pendingForms,
        monthlyRevenue,
        revenueChange,
      }}
    />
  )
}
