// ChatWoot integration — run `npm install chatwoot` or use REST API directly
// Docs: https://www.chatwoot.com/developers/api/

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL || ""
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY || ""
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || ""

export async function fetchChatwootConversations(creatorEmail: string) {
  if (!CHATWOOT_BASE_URL || !CHATWOOT_API_KEY) {
    console.warn("ChatWoot not configured")
    return []
  }

  try {
    const res = await fetch(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`,
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Access-Token": CHATWOOT_API_KEY,
        },
      }
    )
    if (!res.ok) throw new Error(`ChatWoot API error: ${res.status}`)
    const data = await res.json()
    return data.data || []
  } catch (e) {
    console.error("ChatWoot fetch failed:", e)
    return []
  }
}

export async function sendChatwootMessage(conversationId: number, message: string) {
  if (!CHATWOOT_BASE_URL || !CHATWOOT_API_KEY) return null

  try {
    const res = await fetch(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Access-Token": CHATWOOT_API_KEY,
        },
        body: JSON.stringify({ content: message, message_type: "outgoing" }),
      }
    )
    if (!res.ok) throw new Error(`ChatWoot send failed: ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error("ChatWoot send failed:", e)
    return null
  }
}
