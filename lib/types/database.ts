export interface Client {
  id: string
  name: string
  display_name: string | null
  email: string
  phone: string | null
  platform: string | null
  status: string
  avatar: string | null
  monthly_revenue: number | null
  revenue_change: number | null
  subscribers: number | null
  join_date: string | null
  bio: string | null
  notes: string | null
  slug: string | null
  handle: string | null
  crm_status: 'active' | 'prospect' | 'cold_lead' | 'inactive' | 'example' | null
  crisp_people_id: string | null
  last_contact_at: string | null
  next_followup_at: string | null
  assigned_to: string | null
  // Financial info
  bank_name: string | null
  bank_account_number: string | null
  bank_routing_number: string | null
  paypal_email: string | null
  cashapp_handle: string | null
  // Identity info
  id_type: string | null
  id_number: string | null
  id_expiry: string | null
  ssn_last4: string | null
  RFC: string | null
  Government_First_Name: string | null
  Government_Last_Name: string | null
  // Contact info
  private_notes: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  created_at: string
  updated_at: string
}

export interface ClientSocialLink {
  id: string
  creator_id: string
  platform: string
  platform_url: string
  social_media_platform: 'Instagram' | 'Facebook' | 'TikTok' | 'X (Twitter)' | 'Telegram (Public)' | 'OnlyFans (18+)' | 'Fansly (18+)' | 'Telegram (18+)' | 'Discord (18+)' | null
  Adult_Content: string | null
  Follower_Count: number | null
  Explicit_Content: boolean | null
  created_at: string
}

export interface ClientAnalytics {
  id: string
  creator_id: string
  Start_Date: string
  revenue: number
  profit: number
  expenses: number
  subscribers: number
  engagement_rate: number
  content_posted: number
  likes_received: number
  created_at: string
}

export interface ClientTask {
  id: string
  creator_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  assigned_by: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string | null
  creator_id: string
  vendor_id: string | null
  region: string | null
  payment_method: string | null
  status: 'pending' | 'completed' | 'failed'
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface CreatorFormDoc {
  id: string
  creator_id: string
  form_key: string
  title: string
  category: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  payload: Record<string, unknown> | null
  signature_name: string | null
  signed_at: string | null
  approved_by: string | null
  approved_at: string | null
  pdf_storage_path: string | null
  review_comment: string | null
  created_at: string
  updated_at: string
}

export interface LinkHubLink {
  id: string
  creator_id: string
  title: string
  Vespera_Link_URL: string
  icon: string | null
  qr_badge: string | null
  is_featured: boolean
  click_count: number
  position: number
  is_active: boolean
  type: string | null
  price: number | null
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

export interface CreatorConversation {
  id: string
  creator_id: string
  crisp_conversation_id: string | null
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  is_resolved: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreatorMessage {
  id: string
  conversation_id: string
  crisp_message_id: string | null
  direction: 'inbound' | 'outbound'
  content: string
  content_type: string
  sender_type: 'user' | 'operator'
  sender_id: string | null
  attachments: Record<string, unknown>[] | null
  read_at: string | null
  created_at: string
}

export interface CreatorPortalUser {
  id: string
  auth_user_id: string
  creator_id: string | null // NULL for admin users
  role: 'admin' | 'creator'
  created_at: string
  updated_at: string
}

export interface CreatorFile {
  id: string
  creator_id: string | null
  storage_type: 'raw' | 'completed'
  file_name: string
  file_path: string | null
  file_size: number
  mime_type: string | null
  blob_url: string | null
  thumbnail_url: string | null
  metadata: Record<string, unknown> | null
  uploaded_by: string | null
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  file_type: 'image' | 'video' | 'document' | 'other'
  completed_path: string | null
  created_at: string
  updated_at: string
}

export interface MarketplaceItem {
  id: string
  creator_id: string
  title: string
  description: string | null
  price: number
  currency: string
  item_type: 'bundle' | 'video' | 'photo_pack' | 'template' | 'preset' | 'other'
  category: string | null
  keywords: string[]
  cover_image_url: string | null
  preview_images: string[]
  file_ids: string[]
  stock_count: number
  sold_count: number
  is_published: boolean
  is_featured: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface SocialMediaContent {
  id: string
  creator_id: string
  title: string
  description: string | null
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'threads' | 'other'
  content_type: 'post' | 'story' | 'reel' | 'short' | 'video' | 'carousel' | 'other'
  caption: string | null
  hashtags: string[]
  file_ids: string[]
  cover_image_url: string | null
  scheduled_date: string | null
  published_date: string | null
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  engagement_stats: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
