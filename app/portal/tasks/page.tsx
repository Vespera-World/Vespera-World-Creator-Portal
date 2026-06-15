import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TasksClient } from "./tasks-client"
import type { ClientTask, CreatorPortalUser } from "@/lib/types/database"

export default async function TasksPage() {
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

  if (!portalUser?.creator_id) {
    return <TasksClient tasks={[]} clientId="" />
  }

  // Fetch all tasks
  const { data: tasks } = await supabase
    .from("creator_tasks")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
    .order("due_date", { ascending: true, nullsFirst: false }) as { data: ClientTask[] | null }

  return <TasksClient tasks={tasks || []} clientId={portalUser.creator_id} />
}
