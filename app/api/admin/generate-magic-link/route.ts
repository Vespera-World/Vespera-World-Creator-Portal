/**
 * Generate a magic link for a creator via Supabase Admin API
 *
 * POST /api/admin/generate-magic-link
 * Body: { email: string, creatorName?: string, creatorId?: string }
 *
 * This bypasses the broken GoTrue email hook by using the admin API
 * to generate an action_link directly. The link is returned in the response
 * so the agency admin can copy/paste it (for testing) or send it themselves.
 *
 * In production, this should be replaced with a working SMTP hook
 * (e.g., Resend with proper API key).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

interface RequestBody {
  email: string
  creatorName?: string
  creatorId?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server not configured (missing SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 },
      )
    }

    const body = (await request.json()) as RequestBody
    const { email, creatorName, creatorId } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Generate the magic link via admin API
    // Type cast to any since generateLink isn't in the public types
    const { data, error } = await (supabaseAdmin.auth.admin as any).generateLink({
      type: 'magiclink',
      email: email.trim().toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?invite=true`,
      },
    })

    if (error) {
      console.error('[generate-magic-link] error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to generate link' },
        { status: 500 },
      )
    }

    // The action_link contains the magic URL with the token
    const actionLink = data?.properties?.action_link || data?.action_link

    if (!actionLink) {
      return NextResponse.json(
        { error: 'No action link returned from Supabase' },
        { status: 500 },
      )
    }

    // Optionally: create the creator_portal_users record if it doesn't exist
    let portalUserCreated = false
    if (creatorId) {
      const { data: existing } = await supabaseAdmin
        .from('creator_portal_users')
        .select('id')
        .eq('creator_id', creatorId)
        .maybeSingle()

      if (!existing) {
        // We'll fill in auth_user_id when they click the link
        const { error: insertErr } = await supabaseAdmin
          .from('creator_portal_users')
          .insert({
            creator_id: creatorId,
            auth_user_id: null, // filled on first login
            role: 'creator',
          })
        if (!insertErr) portalUserCreated = true
      }
    }

    return NextResponse.json({
      success: true,
      action_link: actionLink,
      email_sent: false, // we didn't send via email, just generated the link
      portal_user_created: portalUserCreated,
      message: 'Magic link generated. Copy the URL and send it to the creator.',
      creator_name: creatorName,
      creator_email: email,
    })
  } catch (e: any) {
    console.error('[generate-magic-link] exception:', e)
    return NextResponse.json(
      { error: e?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}

// GET = health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'admin-generate-magic-link',
    description: 'POST { email, creatorName?, creatorId? } → returns action_link',
  })
}