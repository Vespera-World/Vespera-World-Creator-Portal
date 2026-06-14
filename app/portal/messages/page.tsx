import { createClient } from "@/lib/supabase/server"
import { MessagesClient } from "./messages-client"
import type { CreatorConversation, CreatorMessage, CreatorPortalUser } from "@/lib/types/database"

// Demo data
const demoConversations: CreatorConversation[] = [
  { id: '1', client_id: 'demo', title: 'General', participant_type: 'team', last_message_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString() },
  { id: '2', client_id: 'demo', title: 'Account Manager', participant_type: 'manager', last_message_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date().toISOString() },
]

const demoMessages: CreatorMessage[] = [
  { id: '1', conversation_id: '1', sender_type: 'team', sender_name: 'Sarah (Manager)', content: 'Hey! Your latest video is performing great. Revenue is up 15% this week!', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', conversation_id: '1', sender_type: 'creator', sender_name: 'You', content: 'Thanks! Working on the next one now.', created_at: new Date(Date.now() - 3500000).toISOString() },
  { id: '3', conversation_id: '2', sender_type: 'manager', sender_name: 'Alex (Account Manager)', content: 'Just sent over the new brand deal contract. Please review when you get a chance.', created_at: new Date(Date.now() - 86400000).toISOString() },
]

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return <MessagesClient conversations={demoConversations} messages={demoMessages} clientId="demo" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser) {
    return <MessagesClient conversations={demoConversations} messages={demoMessages} clientId="demo" isDemo />
  }

  const { data: conversations } = await supabase
    .from("creator_conversations")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("last_message_at", { ascending: false }) as { data: CreatorConversation[] | null }

  const conversationIds = conversations?.map(c => c.id) || []
  let messages: CreatorMessage[] = []
  
  if (conversationIds.length > 0) {
    const { data } = await supabase
      .from("creator_messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: true }) as { data: CreatorMessage[] | null }
    messages = data || []
  }

  return <MessagesClient conversations={conversations || []} messages={messages} clientId={portalUser.client_id} />
}
