/**
 * Link click + view tracking endpoint
 * POST /api/track/link-click { link_id }
 * POST /api/track/link-view { link_id }
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

export async function POST(request: NextRequest) {
  try {
    const { link_id } = await request.json()
    if (!link_id) {
      return NextResponse.json({ error: 'link_id required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, reason: 'no admin client' })
    }

    // Use raw SQL to atomically increment (avoids race conditions)
    const { error } = await supabaseAdmin.rpc('increment_link_click' as any, { link_id })

    if (error) {
      // Fallback: do a non-atomic update (better than nothing)
      const { data: link } = await supabaseAdmin
        .from('link_hub_links')
        .select('click_count')
        .eq('id', link_id)
        .single()
      if (link) {
        await supabaseAdmin
          .from('link_hub_links')
          .update({ click_count: (link.click_count || 0) + 1 })
          .eq('id', link_id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
