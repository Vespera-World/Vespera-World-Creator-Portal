import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CreatorsListClient } from "./creators-list-client"
import type { Client, ClientSocialLink } from "@/lib/types/database"

export default async function CreatorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all creators
  const { data: creatorsRaw } = await supabase
    .from("creators")
    .select("*")
    .order("monthly_revenue", { ascending: false, nullsFirst: false }) as { data: Client[] | null }

  // Fetch all social links for all creators
  const { data: socialLinksRaw } = await supabase
    .from("creator_social_links")
    .select("*") as { data: ClientSocialLink[] | null }

  // Create a map of creator_id to social links
  const socialLinksMap = new Map<string, ClientSocialLink[]>()
  ;(socialLinksRaw || []).forEach((link) => {
    const existing = socialLinksMap.get(link.creator_id) || []
    existing.push(link)
    socialLinksMap.set(link.creator_id, existing)
  })

  // Get pending task counts for each creator
  const creators = await Promise.all((creatorsRaw || []).map(async (creator) => {
    const { count } = await supabase
      .from("creator_tasks")
      .select("*", { count: 'exact', head: true })
      .eq("creator_id", creator.id)
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
