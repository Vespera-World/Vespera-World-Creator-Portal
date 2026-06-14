import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { redirect } from "next/navigation"
import type { CreatorPortalUser } from "@/lib/types/database"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode: allow unauthenticated access
  if (!user) {
    return (
      <div className="min-h-screen gradient-mesh">
        <AdminSidebar adminName="Demo Admin" adminEmail="demo@vesperaworld.com" />
        <main className="lg:pl-64">
          <div className="min-h-screen p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Get portal user to check role
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  // If user exists but is not admin, redirect to creator portal
  if (portalUser && portalUser.role !== 'admin') {
    redirect('/portal')
  }

  // If user has no portal user record, they might be new - show demo mode
  const adminName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'
  const adminEmail = user.email || 'admin@vesperaworld.com'

  return (
    <div className="min-h-screen gradient-mesh">
      <AdminSidebar adminName={adminName} adminEmail={adminEmail} />
      <main className="lg:pl-64">
        <div className="min-h-screen p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
