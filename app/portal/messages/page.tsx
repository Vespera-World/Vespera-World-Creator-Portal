import { createClient } from "@/lib/supabase/server"
import { MessagesClient } from "./messages-client"
import type { CreatorConversation, CreatorMessage, CreatorPortalUser } from "@/lib/types/database"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <MessagesClient conversations={[]} messages={[]} clientId="" isDemo />
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser?.creator_id) {
    return <MessagesClient conversations={[]} messages={[]} clientId="" isDemo />
  }

  const { data: conversations } = await supabase
    .from("creator_conversations")
    .select("*")
    .eq("creator_id", portalUser.creator_id)
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

  return <MessagesClient conversations={conversations || []} messages={messages} clientId={portalUser.creator_id} />
}
