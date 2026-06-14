import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const invite = searchParams.get("invite")
  const next = searchParams.get("next") || "/portal"

  const supabase = await createClient()

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    const user = data?.user

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=No+user+found", request.url)
      )
    }

    // INVITE FLOW: Auto-link pending creator_portal_users record
    if (invite === "true") {
      // Find pending record where auth_user_id is NULL and email matches
      const { data: pendingRecords } = await supabase
        .from("creator_portal_users")
        .select("id, auth_user_id, clients!inner(email)")
        .is("auth_user_id", null)
        .eq("status", "pending")
        .single()

      if (pendingRecords) {
        // Update with the new user's auth ID
        await supabase
          .from("creator_portal_users")
          .update({
            auth_user_id: user.id,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", pendingRecords.id)
      }

      return NextResponse.redirect(new URL("/portal", request.url))
    }

    // NORMAL OAUTH FLOW
    return NextResponse.redirect(new URL(next, request.url))
  }

  // No code param — just redirect
  return NextResponse.redirect(new URL(next, request.url))
}
