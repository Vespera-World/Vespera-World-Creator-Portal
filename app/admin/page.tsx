import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "./dashboard-client"
import type { Creator, CreatorTask, Transaction } from "@/lib/types/database"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify admin role
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single()

  if (portalUser?.role !== "admin" && portalUser?.role !== "manager") {
    redirect("/portal")
  }

  // Fetch all active creators (exclude 'example' status)
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .eq("crm_status", "active")
    .order("monthly_revenue", { ascending: false, nullsFirst: false }) as { data: Creator[] | null }

  // Fetch all pending tasks with creator info
  const { data: tasksRaw } = await supabase
    .from("creator_tasks")
    .select("*, creators(name, display_name)")
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(10)

  const tasks = (tasksRaw || []).map((t: CreatorTask & { creators: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.creators?.display_name || t.creators?.name || 'Unknown'
  }))

  // Fetch recent transactions with creator info
  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("*, creators(name, display_name)")
    .order("transaction_date", { ascending: false })
    .limit(10)

  const transactions = (transactionsRaw || []).map((t: Transaction & { creators: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.creators?.display_name || t.creators?.name || 'Unknown'
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
