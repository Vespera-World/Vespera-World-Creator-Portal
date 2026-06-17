/**
 * Creator Onboarding Submission API
 *
 * POST /api/creator/onboarding
 * Body: KYC form fields
 *
 * Saves KYC data to creators table and logs to creator_onboarding_submissions for audit.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

interface OnboardingPayload {
  id_type?: string
  id_number?: string
  id_expiry?: string
  ssn_last4?: string
  Government_First_Name?: string
  Government_Last_Name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  RFC?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* no-op for POST */ },
        },
      },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Find the creator_portal_user mapping
    const { data: portalUser } = await supabaseAdmin
      .from('creator_portal_users')
      .select('creator_id, id_verification_method')
      .eq('auth_user_id', user.id)
      .single()

    if (!portalUser?.creator_id) {
      return NextResponse.json(
        { error: 'No creator profile linked to your account' },
        { status: 400 },
      )
    }

    const body = (await request.json()) as OnboardingPayload

    // Build the update object (only include fields that were sent)
    const update: Record<string, unknown> = {}
    const allowed = [
      'id_type', 'id_number', 'id_expiry', 'ssn_last4',
      'Government_First_Name', 'Government_Last_Name',
      'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country',
      'RFC', 'emergency_contact_name', 'emergency_contact_phone',
    ] as const
    for (const k of allowed) {
      const v = body[k]
      if (v != null && v !== '') update[k] = v
    }

    // Normalize: empty strings to null, trim
    for (const k of Object.keys(update)) {
      const v = update[k]
      if (typeof v === 'string') update[k] = v.trim() || null
    }

    // Convert id_expiry to ISO date if present
    if (update.id_expiry && typeof update.id_expiry === 'string') {
      const d = new Date(update.id_expiry)
      if (!isNaN(d.getTime())) update.id_expiry = d.toISOString().split('T')[0]
    }

    update.updated_at = new Date().toISOString()

    // 1. Update creators table
    const { error: updateErr } = await supabaseAdmin
      .from('creators')
      .update(update)
      .eq('id', portalUser.creator_id)

    if (updateErr) throw updateErr

    // 2. Log submission for audit
    const { error: logErr } = await supabaseAdmin
      .from('creator_onboarding_submissions')
      .insert({
        creator_id: portalUser.creator_id,
        creator_handle: user.email?.split('@')[0] || null,
        id_verification_method: body.id_type || 'manual_fields',
        form_data: body,
        status: 'submitted',
      })

    if (logErr) {
      // Non-fatal: log but don't fail the request
      console.error('[onboarding] Failed to log submission:', logErr)
    }

    return NextResponse.json({
      success: true,
      creator_id: portalUser.creator_id,
      fields_updated: Object.keys(update).length,
    })
  } catch (e: any) {
    console.error('[onboarding] error:', e)
    return NextResponse.json(
      { error: e?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}