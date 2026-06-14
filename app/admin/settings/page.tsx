import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "./settings-client"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isDemo = !user

  return <SettingsClient isDemo={isDemo} userEmail={user?.email} />
}
