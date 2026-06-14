import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin/manager
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: portalUser } = await supabase
      .from("creator_portal_users")
      .select("role")
      .eq("auth_user_id", user.id)
      .single()

    if (!portalUser || (portalUser.role !== "admin" && portalUser.role !== "manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, display_name } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Create client record first
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        display_name: display_name || name,
        email,
        status: "active",
        crm_status: "active",
      })
      .select()
      .single()

    if (clientError) {
      console.error("Failed to create client:", clientError)
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }

    // Send magic link using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?invite=true`,
      },
    })

    // Fallback: use signInWithOtp for non-admin API key
    let magicLinkSent = false
    if (authError) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?invite=true`,
        },
      })
      if (!otpError) magicLinkSent = true
    } else {
      magicLinkSent = true
    }

    if (!magicLinkSent) {
      // Rollback client creation
      await supabase.from("clients").delete().eq("id", client.id)
      return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 })
    }

    // Create invite record
    await supabase.from("creator_portal_users").insert({
      auth_user_id: null, // filled on first login
      client_id: client.id,
      role: "creator",
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      client_id: client.id,
    })
  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
