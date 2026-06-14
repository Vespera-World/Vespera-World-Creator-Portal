import { createClient } from "@/lib/supabase/server"
import { CreatorsListClient } from "./creators-list-client"
import type { Client, ClientTask } from "@/lib/types/database"

// Demo data
const DEMO_CREATORS: (Client & { pending_tasks: number })[] = [
  { id: "demo-1", name: "Star", display_name: "Star Luna", email: "star@vesperaworld.com", status: "active", monthly_revenue: 24750, revenue_change: 12.5, subscribers: 15400, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: new Date(Date.now() - 90 * 86400000).toISOString(), bio: "Top creator on OnlyFans", vespera_slug: "star-luna", pending_tasks: 2 },
  { id: "demo-2", name: "Nova", display_name: "Nova Skye", email: "nova@vesperaworld.com", status: "active", monthly_revenue: 18200, revenue_change: 8.3, subscribers: 12800, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: new Date(Date.now() - 120 * 86400000).toISOString(), bio: "Rising star on Fansly", vespera_slug: "nova-skye", pending_tasks: 1 },
  { id: "demo-3", name: "Ember", display_name: "Ember Rose", email: "ember@vesperaworld.com", status: "active", monthly_revenue: 31500, revenue_change: 22.1, subscribers: 21000, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: new Date(Date.now() - 60 * 86400000).toISOString(), bio: "Premium content creator", vespera_slug: "ember-rose", pending_tasks: 1 },
  { id: "demo-4", name: "Luna", display_name: "Luna Midnight", email: "luna@vesperaworld.com", status: "active", monthly_revenue: 14300, revenue_change: -3.2, subscribers: 9500, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: new Date(Date.now() - 180 * 86400000).toISOString(), bio: "Creative content specialist", vespera_slug: "luna-midnight", pending_tasks: 0 },
  { id: "demo-5", name: "Aurora", display_name: "Aurora Blaze", email: "aurora@vesperaworld.com", status: "inactive", monthly_revenue: 0, revenue_change: 0, subscribers: 5200, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: new Date(Date.now() - 240 * 86400000).toISOString(), bio: "On hiatus", vespera_slug: "aurora-blaze", pending_tasks: 3 },
]

export default async function CreatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <CreatorsListClient creators={DEMO_CREATORS} isDemo />
  }

  // Fetch all creators with task counts
  const { data: creatorsRaw } = await supabase
    .from("clients")
    .select("*")
    .order("monthly_revenue", { ascending: false }) as { data: Client[] | null }

  // Get pending task counts for each creator
  const creators = await Promise.all((creatorsRaw || []).map(async (creator) => {
    const { count } = await supabase
      .from("client_tasks")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", creator.id)
      .neq("status", "completed")
    
    return {
      ...creator,
      pending_tasks: count || 0
    }
  }))

  return <CreatorsListClient creators={creators} />
}
