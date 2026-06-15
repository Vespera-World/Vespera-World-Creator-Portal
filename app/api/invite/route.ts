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

    // Create creator record first
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .insert({
        name,
        display_name: display_name || name,
        handle: name,
        email,
        status: "active",
        crm_status: "active",
      })
      .select()
      .single()

    if (creatorError) {
      console.error("Failed to create creator:", creatorError)
      return NextResponse.json({ error: "Failed to create creator" }, { status: 500 })
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
      // Rollback creator creation
      await supabase.from("creators").delete().eq("id", creator.id)
      return NextResponse.json({ error: "Failed to send invite email" }, { status: 500 })
    }

    // Create invite record
    await supabase.from("creator_portal_users").insert({
      auth_user_id: null, // filled on first login
      creator_id: creator.id,
      role: "creator",
    })

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      creator_id: creator.id,
    })
  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
