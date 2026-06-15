import { createClient } from "@/lib/supabase/server"
import { AnalyticsClient } from "./analytics-client"
import type { Creator, Transaction } from "@/lib/types/database"

// Demo data
const DEMO_CREATORS: Client[] = [
  { id: "demo-1", name: "Star", display_name: "Star Luna", email: "star@vesperaworld.com", status: "active", monthly_revenue: 24750, revenue_change: 12.5, subscribers: 15400, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-2", name: "Nova", display_name: "Nova Skye", email: "nova@vesperaworld.com", status: "active", monthly_revenue: 18200, revenue_change: 8.3, subscribers: 12800, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-3", name: "Ember", display_name: "Ember Rose", email: "ember@vesperaworld.com", status: "active", monthly_revenue: 31500, revenue_change: 22.1, subscribers: 21000, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
  { id: "demo-4", name: "Luna", display_name: "Luna Midnight", email: "luna@vesperaworld.com", status: "active", monthly_revenue: 14300, revenue_change: -3.2, subscribers: 9500, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: null, avatar: null, join_date: null, bio: null, vespera_slug: null },
]

const DEMO_MONTHLY_DATA = [
  { month: "Jan", revenue: 65000, subscribers: 45000 },
  { month: "Feb", revenue: 72000, subscribers: 48000 },
  { month: "Mar", revenue: 78000, subscribers: 51000 },
  { month: "Apr", revenue: 82000, subscribers: 54000 },
  { month: "May", revenue: 88750, subscribers: 58700 },
]

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return (
      <AnalyticsClient
        creators={DEMO_CREATORS}
        monthlyData={DEMO_MONTHLY_DATA}
        isDemo
      />
    )
  }

  // Fetch all active creators
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .eq("status", "active")
    .order("monthly_revenue", { ascending: false }) as { data: Creator[] | null }

  // For now, use demo monthly data - in a real app you'd aggregate from transactions
  // This would typically be a more complex query grouping by month
  return (
    <AnalyticsClient
      creators={creators || []}
      monthlyData={DEMO_MONTHLY_DATA}
    />
  )
}
