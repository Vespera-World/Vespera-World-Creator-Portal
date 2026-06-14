import { createClient } from "@/lib/supabase/server"
import { CreatorsListClient } from "./creators-list-client"
import type { Client, ClientSocialLink } from "@/lib/types/database"

// Helper to create a demo client with all required fields
function createDemoClient(partial: Partial<Client> & { id: string; name: string; email: string; pending_tasks?: number }): Client & { pending_tasks: number; social_links: ClientSocialLink[]; total_followers: number } {
  return {
    id: partial.id,
    name: partial.name,
    display_name: partial.display_name ?? null,
    email: partial.email,
    phone: partial.phone ?? null,
    platform: partial.platform ?? null,
    status: partial.status ?? 'active',
    avatar: partial.avatar ?? null,
    monthly_revenue: partial.monthly_revenue ?? null,
    revenue_change: partial.revenue_change ?? null,
    subscribers: partial.subscribers ?? null,
    join_date: partial.join_date ?? null,
    bio: partial.bio ?? null,
    notes: partial.notes ?? null,
    vespera_slug: partial.vespera_slug ?? null,
    crm_status: partial.crm_status ?? 'active',
    crisp_people_id: null,
    last_contact_at: null,
    next_followup_at: null,
    assigned_to: null,
    bank_name: null,
    bank_account_number: null,
    bank_routing_number: null,
    paypal_email: null,
    cashapp_handle: null,
    id_type: null,
    id_number: null,
    id_expiry: null,
    ssn_last4: null,
    RFC: null,
    Government_First_Name: null,
    Government_Last_Name: null,
    private_notes: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    address_line1: null,
    address_line2: null,
    city: null,
    state: null,
    zip_code: null,
    country: null,
    created_at: partial.created_at ?? new Date().toISOString(),
    updated_at: partial.updated_at ?? new Date().toISOString(),
    pending_tasks: partial.pending_tasks ?? 0,
    social_links: [],
    total_followers: partial.subscribers ?? 0,
  }
}

// Demo data
const DEMO_CREATORS = [
  createDemoClient({ id: "demo-1", name: "Star", display_name: "Star Luna", email: "star@vesperaworld.com", status: "active", crm_status: "active", monthly_revenue: 24750, revenue_change: 12.5, subscribers: 15400, platform: "OnlyFans", join_date: new Date(Date.now() - 90 * 86400000).toISOString(), bio: "Top creator on OnlyFans", vespera_slug: "star-luna", pending_tasks: 2 }),
  createDemoClient({ id: "demo-2", name: "Nova", display_name: "Nova Skye", email: "nova@vesperaworld.com", status: "active", crm_status: "active", monthly_revenue: 18200, revenue_change: 8.3, subscribers: 12800, platform: "Fansly", join_date: new Date(Date.now() - 120 * 86400000).toISOString(), bio: "Rising star on Fansly", vespera_slug: "nova-skye", pending_tasks: 1 }),
  createDemoClient({ id: "demo-3", name: "Ember", display_name: "Ember Rose", email: "ember@vesperaworld.com", status: "active", crm_status: "active", monthly_revenue: 31500, revenue_change: 22.1, subscribers: 21000, platform: "OnlyFans", join_date: new Date(Date.now() - 60 * 86400000).toISOString(), bio: "Premium content creator", vespera_slug: "ember-rose", pending_tasks: 1 }),
  createDemoClient({ id: "demo-4", name: "Luna", display_name: "Luna Midnight", email: "luna@vesperaworld.com", status: "active", crm_status: "active", monthly_revenue: 14300, revenue_change: -3.2, subscribers: 9500, platform: "Fansly", join_date: new Date(Date.now() - 180 * 86400000).toISOString(), bio: "Creative content specialist", vespera_slug: "luna-midnight", pending_tasks: 0 }),
  createDemoClient({ id: "demo-5", name: "Aurora", display_name: "Aurora Blaze", email: "aurora@vesperaworld.com", status: "inactive", crm_status: "inactive", monthly_revenue: 0, revenue_change: 0, subscribers: 5200, platform: "OnlyFans", join_date: new Date(Date.now() - 240 * 86400000).toISOString(), bio: "On hiatus", vespera_slug: "aurora-blaze", pending_tasks: 3 }),
]

export default async function CreatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <CreatorsListClient creators={DEMO_CREATORS} isDemo />
  }

  // Fetch all creators (excluding 'example' status)
  const { data: creatorsRaw } = await supabase
    .from("clients")
    .select("*")
    .neq("crm_status", "example")
    .order("monthly_revenue", { ascending: false, nullsFirst: false }) as { data: Client[] | null }

  // Fetch all social links for all creators
  const { data: socialLinksRaw } = await supabase
    .from("client_social_links")
    .select("*") as { data: ClientSocialLink[] | null }

  // Create a map of client_id to social links
  const socialLinksMap = new Map<string, ClientSocialLink[]>()
  ;(socialLinksRaw || []).forEach((link) => {
    const existing = socialLinksMap.get(link.client_id) || []
    existing.push(link)
    socialLinksMap.set(link.client_id, existing)
  })

  // Get pending task counts for each creator
  const creators = await Promise.all((creatorsRaw || []).map(async (creator) => {
    const { count } = await supabase
      .from("client_tasks")
      .select("*", { count: 'exact', head: true })
      .eq("client_id", creator.id)
      .neq("status", "completed")
    
    const socialLinks = socialLinksMap.get(creator.id) || []
    const totalFollowers = socialLinks.reduce((sum, link) => sum + (link.Follower_Count || 0), 0)
    
    return {
      ...creator,
      pending_tasks: count || 0,
      social_links: socialLinks,
      total_followers: totalFollowers,
    }
  }))

  return <CreatorsListClient creators={creators} />
}
