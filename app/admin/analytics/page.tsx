import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AnalyticsClient } from "./analytics-client"
import type { Client } from "@/lib/types/database"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all active creators
  const { data: creators } = await supabase
    .from("creators")
    .select("*")
    .eq("status", "active")
    .order("monthly_revenue", { ascending: false }) as { data: Client[] | null }

  // Aggregate monthly revenue/subscribers from creator_analytics
  const { data: analyticsRows } = await supabase
    .from("creator_analytics")
    .select("Start_Date, revenue, subscribers")
    .order("Start_Date", { ascending: true }) as {
      data: { Start_Date: string; revenue: number | null; subscribers: number | null }[] | null
    }

  const monthlyMap = new Map<string, { month: string; revenue: number; subscribers: number }>()
  ;(analyticsRows || []).forEach((row) => {
    if (!row.Start_Date) return
    const date = new Date(row.Start_Date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const month = date.toLocaleString("en-US", { month: "short" })
    const existing = monthlyMap.get(key) || { month, revenue: 0, subscribers: 0 }
    existing.revenue += Number(row.revenue) || 0
    existing.subscribers += Number(row.subscribers) || 0
    monthlyMap.set(key, existing)
  })
  const monthlyData = Array.from(monthlyMap.values())

  return (
    <AnalyticsClient
      creators={creators || []}
      monthlyData={monthlyData}
    />
  )
}
