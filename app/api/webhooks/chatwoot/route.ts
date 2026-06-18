/**
 * ChatWoot Webhook Handler
 *
 * Receives events from ChatWoot and syncs them into Supabase.
 * Endpoints:
 *   POST /api/webhooks/chatwoot  — main webhook receiver
 *
 * ChatWoot webhook docs: https://www.chatwoot.com/developers/api/#webhook-events
 *
 * Headers:
 *   X-Chatwoot-Signature: HMAC-SHA256 of payload using CHATWOOT_WEBHOOK_SECRET
 *   X-Chatwoot-Timestamp: unix timestamp
 *
 * Events we handle:
 *   - conversation_created
 *   - conversation_status_changed
 *   - conversation_updated
 *   - message_created (incoming fan messages, outgoing agent replies)
 *   - message_updated
 */

import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database'

// Disable Next.js cache for this route
export const dynamic = 'force-dynamic'

const CHATWOOT_WEBHOOK_SECRET = process.env.CHATWOOT_WEBHOOK_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use service-role client to bypass RLS for webhook inserts
const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!CHATWOOT_WEBHOOK_SECRET) {
    // No secret configured — log warning but allow in dev
    console.warn('[chatwoot-webhook] CHATWOOT_WEBHOOK_SECRET not set, skipping verification')
    return process.env.NODE_ENV === 'development'
  }
  if (!signature) return false

  try {
    const expected = createHmac('sha256', CHATWOOT_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('base64')

    // timingSafeEqual requires equal-length buffers
    const expectedBuf = Buffer.from(expected)
    const signatureBuf = Buffer.from(signature)
    if (expectedBuf.length !== signatureBuf.length) return false
    return timingSafeEqual(expectedBuf, signatureBuf)
  } catch (e) {
    console.error('[chatwoot-webhook] Signature verification error:', e)
    return false
  }
}

interface ChatwootConversation {
  id: number
  account_id: number
  status: 'open' | 'resolved' | 'pending' | 'snoozed'
  inbox_id: number
  contact_id?: number
  meta?: {
    sender?: {
      name?: string
      email?: string
      phone_number?: string
      thumbnail?: string
    }
    channel?: string
  }
  labels?: string[]
  last_activity_at?: number
  unread_count?: number
  custom_attributes?: Record<string, unknown>
}

interface ChatwootMessage {
  id: number
  conversation_id: number
  content: string | null
  message_type: 0 | 1 | 2 // 0=incoming, 1=outgoing, 2=activity
  content_type: string
  private: boolean
  created_at: number
  sender?: {
    id?: number
    name?: string
    type?: string
  }
  attachments?: Array<{
    id: number
    file_type: string
    data_url: string
  }>
}

interface ChatwootWebhookPayload {
  event: string
  id?: string
  account?: { id: number }
  conversation?: ChatwootConversation
  message?: ChatwootMessage
  changed_attributes?: Record<string, unknown>
}

const VESPERA_ORG_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Look up creator by ChatWoot contact identifier (custom attribute or label).
 * Convention: ChatWoot contact has a `creator_slug` custom attribute,
 * or the conversation has a label matching a creator slug.
 */
async function findCreatorForConversation(
  conv: ChatwootConversation
): Promise<{ creatorId: string | null; organizationId: string | null }> {
  if (!supabaseAdmin) return { creatorId: null, organizationId: null }

  // Strategy 1: custom attribute `creator_slug` on conversation
  const slug = (conv.custom_attributes?.creator_slug as string) || null

  // Strategy 2: label matching a creator slug
  const labelSlug = conv.labels?.find((l) => l.startsWith('creator:'))?.replace('creator:', '')

  const targetSlug = slug || labelSlug

  if (targetSlug) {
    const { data: creator } = await supabaseAdmin
      .from('creators')
      .select('id, organization_id')
      .eq('slug', targetSlug)
      .single()
    if (creator) {
      return { creatorId: creator.id, organizationId: creator.organization_id }
    }
  }

  // Strategy 3: contact email matches a creator email
  if (conv.meta?.sender?.email) {
    const { data: creator } = await supabaseAdmin
      .from('creators')
      .select('id, organization_id')
      .eq('email', conv.meta.sender.email)
      .single()
    if (creator) {
      return { creatorId: creator.id, organizationId: creator.organization_id }
    }
  }

  // Default: assign to the Vespera org (catch-all)
  return { creatorId: null, organizationId: VESPERA_ORG_ID }
}

async function upsertConversation(conv: ChatwootConversation): Promise<string | null> {
  if (!supabaseAdmin) return null

  const { creatorId, organizationId } = await findCreatorForConversation(conv)

  const conversationRow = {
    chatwoot_id: conv.id,
    chatwoot_account_id: conv.account_id,
    organization_id: organizationId,
    creator_id: creatorId,
    status: conv.status,
    channel: conv.meta?.channel || null,
    inbox_id: conv.inbox_id,
    contact_id: conv.contact_id || null,
    contact_name: conv.meta?.sender?.name || null,
    contact_email: conv.meta?.sender?.email || null,
    contact_phone: conv.meta?.sender?.phone_number || null,
    contact_avatar_url: conv.meta?.sender?.thumbnail || null,
    last_message_at: conv.last_activity_at
      ? new Date(conv.last_activity_at * 1000).toISOString()
      : null,
    unread_count: conv.unread_count || 0,
    raw_payload: conv as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from('chatwoot_conversations')
    .upsert(conversationRow, { onConflict: 'chatwoot_account_id,chatwoot_id' })
    .select('id')
    .single()

  if (error) {
    console.error('[chatwoot-webhook] upsert conversation error:', error)
    return null
  }
  return data?.id || null
}

async function insertMessage(
  conversationUuid: string,
  conv: ChatwootConversation,
  msg: ChatwootMessage
): Promise<boolean> {
  if (!supabaseAdmin) return false

  // ChatWoot message_type: 0=incoming (from fan), 1=outgoing (from agent/creator), 2=activity
  const messageTypeMap: Record<number, string> = {
    0: 'incoming',
    1: 'outgoing',
    2: 'activity',
  }

  const messageRow = {
    conversation_id: conversationUuid,
    chatwoot_message_id: msg.id,
    chatwoot_conversation_id: msg.conversation_id,
    content: msg.content,
    message_type: messageTypeMap[msg.message_type] || 'unknown',
    content_type: msg.content_type,
    private: msg.private,
    sender_name: msg.sender?.name || null,
    sender_type: msg.sender?.type || null,
    attachments: msg.attachments || [],
    raw_payload: msg as unknown as Record<string, unknown>,
    created_at: new Date(msg.created_at * 1000).toISOString(),
  }

  const { error } = await supabaseAdmin
    .from('chatwoot_messages')
    .upsert(messageRow, { onConflict: 'chatwoot_conversation_id,chatwoot_message_id' })

  if (error) {
    console.error('[chatwoot-webhook] insert message error:', error)
    return false
  }

  // Update conversation's last_message_preview
  if (msg.content && !msg.private) {
    await supabaseAdmin
      .from('chatwoot_conversations')
      .update({
        last_message_preview: msg.content.slice(0, 200),
        last_message_at: messageRow.created_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationUuid)
  }

  return true
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-chatwoot-signature')
  const timestamp = request.headers.get('x-chatwoot-timestamp')

  // 1. Verify signature
  const signatureValid = verifySignature(rawBody, signature)
  if (!signatureValid) {
    console.error('[chatwoot-webhook] Invalid signature, rejecting request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: ChatwootWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch (e) {
    console.error('[chatwoot-webhook] Failed to parse JSON:', e)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!payload.event) {
    return NextResponse.json({ error: 'Missing event type' }, { status: 400 })
  }

  // 3. Log the webhook event (always, even for unknown events)
  let loggedEventId: string | null = null
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('chatwoot_webhook_events')
      .insert({
        event_type: payload.event,
        event_id: payload.id || null,
        payload: payload as unknown as Record<string, unknown>,
        signature_valid: signatureValid,
      })
      .select('id')
      .single()
    loggedEventId = data?.id || null
  }

  // 4. Process the event
  let conversationUuid: string | null = null
  let processed = false
  let errorMessage: string | null = null

  try {
    switch (payload.event) {
      case 'conversation_created':
      case 'conversation_updated': {
        if (payload.conversation) {
          conversationUuid = await upsertConversation(payload.conversation)
          processed = !!conversationUuid
        }
        break
      }

      case 'conversation_status_changed': {
        if (payload.conversation) {
          conversationUuid = await upsertConversation(payload.conversation)
          processed = !!conversationUuid
        }
        break
      }

      case 'message_created':
      case 'message_updated': {
        if (payload.conversation && payload.message) {
          conversationUuid = await upsertConversation(payload.conversation)
          if (conversationUuid) {
            processed = await insertMessage(conversationUuid, payload.conversation, payload.message)
          }
        }
        break
      }

      default:
        // Logged but not processed (we don't handle this event type yet)
        processed = false
        console.log(`[chatwoot-webhook] Unhandled event: ${payload.event}`)
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e)
    console.error(`[chatwoot-webhook] Error processing ${payload.event}:`, e)
  }

  // 5. Update the log entry with results
  if (loggedEventId && supabaseAdmin) {
    await supabaseAdmin
      .from('chatwoot_webhook_events')
      .update({
        processed,
        error_message: errorMessage,
        conversation_id: conversationUuid,
        processed_at: new Date().toISOString(),
      })
      .eq('id', loggedEventId)
  }

  return NextResponse.json({
    ok: true,
    event: payload.event,
    processed,
    conversation_id: conversationUuid,
    webhook_event_id: loggedEventId,
    timestamp: timestamp || null,
  })
}

// Health check for ChatWoot to verify the webhook is reachable
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'chatwoot-webhook',
    events_supported: [
      'conversation_created',
      'conversation_updated',
      'conversation_status_changed',
      'message_created',
      'message_updated',
    ],
    signature_required: !!CHATWOOT_WEBHOOK_SECRET,
  })
}
