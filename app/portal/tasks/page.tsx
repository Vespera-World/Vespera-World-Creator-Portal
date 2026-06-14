import { createClient } from "@/lib/supabase/server"
import { TasksClient } from "./tasks-client"
import type { ClientTask, CreatorPortalUser } from "@/lib/types/database"

// Demo data for unauthenticated users
const demoTasks: ClientTask[] = [
  { id: '1', client_id: 'demo', title: 'Complete onboarding paperwork', description: 'Fill out all required forms', status: 'pending', priority: 'high', due_date: new Date(Date.now() + 86400000 * 2).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', client_id: 'demo', title: 'Set up payment method', description: 'Add bank details for payouts', status: 'pending', priority: 'medium', due_date: new Date(Date.now() + 86400000 * 5).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', client_id: 'demo', title: 'Review content guidelines', description: 'Read through platform policies', status: 'completed', priority: 'low', due_date: new Date(Date.now() - 86400000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', client_id: 'demo', title: 'Upload profile photo', description: 'High quality headshot required', status: 'in_progress', priority: 'medium', due_date: new Date(Date.now() + 86400000 * 3).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode - no auth
  if (!user) {
    return <TasksClient tasks={demoTasks} clientId="demo" isDemo />
  }

  // Get creator portal user mapping
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <TasksClient tasks={demoTasks} clientId="demo" isDemo />
  }

  // Fetch all tasks
  const { data: tasks } = await supabase
    .from("client_tasks")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("due_date", { ascending: true, nullsFirst: false }) as { data: ClientTask[] | null }

  return <TasksClient tasks={tasks || []} clientId={portalUser.client_id} />
}
