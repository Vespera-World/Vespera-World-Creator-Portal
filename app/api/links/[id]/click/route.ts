import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  // Increment click_count by 1
  const { data, error } = await supabase.rpc("increment_link_click", { link_id: id })

  if (error) {
    // Fallback: try direct update if RPC doesn't exist
    const { data: link } = await supabase
      .from("link_hub_links")
      .select("click_count, clicks")
      .eq("id", id)
      .single()

    if (link) {
      await supabase
        .from("link_hub_links")
        .update({
          click_count: (link.click_count || 0) + 1,
          clicks: (link.clicks || 0) + 1,
        })
        .eq("id", id)
    }
  }

  return NextResponse.json({ ok: true })
}
