import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CreatorDetailClient } from "./creator-detail-client"
import type { Client, ClientTask, Transaction, CreatorFormDoc, ClientSocialLink, ClientAnalytics } from "@/lib/types/database"

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch creator
  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("id", id)
    .single() as { data: Client | null }

  if (!creator) {
    notFound()
  }

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("creator_tasks")
    .select("*")
    .eq("creator_id", id)
    .order("due_date", { ascending: true }) as { data: ClientTask[] | null }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("creator_id", id)
    .order("transaction_date", { ascending: false })
    .limit(10) as { data: Transaction[] | null }

  // Fetch forms
  const { data: forms } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("creator_id", id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from("creator_social_links")
    .select("*")
    .eq("creator_id", id)
    .order("Follower_Count", { ascending: false, nullsFirst: false }) as { data: ClientSocialLink[] | null }

  // Fetch analytics
  const { data: analytics } = await supabase
    .from("creator_analytics")
    .select("*")
    .eq("creator_id", id)
    .order("Start_Date", { ascending: false })
    .limit(1) as { data: ClientAnalytics[] | null }

  return (
    <CreatorDetailClient
      creator={creator}
      tasks={tasks || []}
      transactions={transactions || []}
      forms={forms || []}
      socialLinks={socialLinks || []}
      analytics={analytics?.[0] || null}
    />
  )
}
