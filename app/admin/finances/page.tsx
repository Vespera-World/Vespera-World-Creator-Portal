import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FinancesClient } from "./finances-client"
import type { Client, Transaction } from "@/lib/types/database"

export default async function AdminFinancesPage() {
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
    .order("name") as { data: Client[] | null }

  // Fetch all transactions with creator info
  const { data: transactionsRaw } = await supabase
    .from("transactions")
    .select("*, creators(name, display_name)")
    .order("transaction_date", { ascending: false })
    .limit(100)

  const transactions = (transactionsRaw || []).map((t: Transaction & { creators: { name: string, display_name: string | null } | null }) => ({
    ...t,
    creator_name: t.creators?.display_name || t.creators?.name || 'Unknown'
  }))

  return (
    <FinancesClient
      creators={creators || []}
      transactions={transactions}
    />
  )
}
