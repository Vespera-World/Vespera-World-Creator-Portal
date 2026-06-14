import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CreatorDetailClient } from "./creator-detail-client"
import type { Client, ClientTask, Transaction, CreatorFormDoc } from "@/lib/types/database"

// Demo data generator
function getDemoData(id: string) {
  const creators: Record<string, Client> = {
    "demo-1": { id: "demo-1", name: "Star", display_name: "Star Luna", email: "star@vesperaworld.com", status: "active", monthly_revenue: 24750, revenue_change: 12.5, subscribers: 15400, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: "+1 555-0101", avatar: null, join_date: new Date(Date.now() - 90 * 86400000).toISOString(), bio: "Top creator on OnlyFans with engaging content", vespera_slug: "star-luna" },
    "demo-2": { id: "demo-2", name: "Nova", display_name: "Nova Skye", email: "nova@vesperaworld.com", status: "active", monthly_revenue: 18200, revenue_change: 8.3, subscribers: 12800, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: "+1 555-0102", avatar: null, join_date: new Date(Date.now() - 120 * 86400000).toISOString(), bio: "Rising star on Fansly", vespera_slug: "nova-skye" },
    "demo-3": { id: "demo-3", name: "Ember", display_name: "Ember Rose", email: "ember@vesperaworld.com", status: "active", monthly_revenue: 31500, revenue_change: 22.1, subscribers: 21000, platform: "OnlyFans", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: "+1 555-0103", avatar: null, join_date: new Date(Date.now() - 60 * 86400000).toISOString(), bio: "Premium content creator", vespera_slug: "ember-rose" },
    "demo-4": { id: "demo-4", name: "Luna", display_name: "Luna Midnight", email: "luna@vesperaworld.com", status: "active", monthly_revenue: 14300, revenue_change: -3.2, subscribers: 9500, platform: "Fansly", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phone: "+1 555-0104", avatar: null, join_date: new Date(Date.now() - 180 * 86400000).toISOString(), bio: "Creative content specialist", vespera_slug: "luna-midnight" },
  }

  const creator = creators[id]
  if (!creator) return null

  const tasks: ClientTask[] = [
    { id: "1", client_id: id, title: "Complete profile setup", description: "Update bio and profile photo", status: "pending", priority: "high", due_date: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null },
    { id: "2", client_id: id, title: "Review content calendar", description: "Approve posts for next week", status: "in_progress", priority: "medium", due_date: new Date(Date.now() + 172800000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assigned_by: null },
  ]

  const transactions: Transaction[] = [
    { id: "1", client_id: id, type: "income", amount: 4250, description: `${creator.platform} payout - May`, category: "platform", transaction_date: new Date(Date.now() - 86400000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null },
    { id: "2", client_id: id, type: "expense", amount: 350, description: "Content production", category: "production", transaction_date: new Date(Date.now() - 172800000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null },
    { id: "3", client_id: id, type: "income", amount: 3800, description: `${creator.platform} payout - April`, category: "platform", transaction_date: new Date(Date.now() - 604800000).toISOString(), status: "completed", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), vendor_id: null, region: null, payment_method: null },
  ]

  const forms: CreatorFormDoc[] = [
    { id: "1", client_id: id, form_key: "contractor", title: "Independent Contractor Agreement", category: "contract", status: "approved", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), payload: null, signature_name: "Star Luna", signed_at: new Date().toISOString(), approved_by: null, approved_at: null, pdf_storage_path: null, review_comment: null },
    { id: "2", client_id: id, form_key: "w9", title: "W-9 Tax Form", category: "tax", status: "pending", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), payload: null, signature_name: null, signed_at: null, approved_by: null, approved_at: null, pdf_storage_path: null, review_comment: null },
  ]

  return { creator, tasks, transactions, forms }
}

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    const demoData = getDemoData(id)
    if (!demoData) notFound()
    
    return (
      <CreatorDetailClient
        creator={demoData.creator}
        tasks={demoData.tasks}
        transactions={demoData.transactions}
        forms={demoData.forms}
        isDemo
      />
    )
  }

  // Fetch creator
  const { data: creator } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single() as { data: Client | null }

  if (!creator) {
    notFound()
  }

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("client_tasks")
    .select("*")
    .eq("client_id", id)
    .order("due_date", { ascending: true }) as { data: ClientTask[] | null }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_id", id)
    .order("transaction_date", { ascending: false })
    .limit(10) as { data: Transaction[] | null }

  // Fetch forms
  const { data: forms } = await supabase
    .from("creator_forms_docs")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false }) as { data: CreatorFormDoc[] | null }

  return (
    <CreatorDetailClient
      creator={creator}
      tasks={tasks || []}
      transactions={transactions || []}
      forms={forms || []}
    />
  )
}
