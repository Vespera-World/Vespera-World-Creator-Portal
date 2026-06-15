import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import type { Creator, CreatorTask, Transaction, CreatorFormDoc, CreatorPortalUser } from "@/lib/types/database"
import { redirect } from "next/navigation"

export default async function PortalDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
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

  // Fetch creator details
  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", portalUser.creator_id)
    .single() as { data: Creator | null }

  // Fetch pending tasks
  const { data: tasks } = await supabase
    .from("creator_tasks")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(5) as { data: CreatorTask[] | null }

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("transaction_date", { ascending: false })
    .limit(5) as { data: Transaction[] | null }

  // Fetch forms/docs status
  const { data: formsDocs } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  // Calculate stats
  const pendingTasks = tasks?.length || 0
  const pendingForms = formsDocs?.filter(f => f.status === 'pending' || f.status === 'draft').length || 0
  const monthlyRevenue = creator?.monthly_revenue || 0
  const revenueChange = creator?.revenue_change || 0

  return (
    <DashboardClient
      client={creator}
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
