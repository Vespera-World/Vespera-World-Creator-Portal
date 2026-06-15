import { createClient } from "@/lib/supabase/server"
import { PortalSidebar } from "@/components/portal/portal-sidebar"
import type { Creator, CreatorPortalUser } from "@/lib/types/database"
import { redirect } from "next/navigation"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let creator: Creator | null = null

  // Get creator portal user mapping
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (portalUser?.creator_id) {
    const { data } = await supabase
      .from("creators")
      .select("*")
      .eq("id", portalUser.creator_id)
      .single() as { data: Creator | null }
    creator = data
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <PortalSidebar client={creator} />
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
