import { createClient } from "@/lib/supabase/server"
import { ContentClient } from "./content-client"
import type { CreatorFile, Client, CreatorPortalUser, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

// Demo data
const demoClient: Client = {
  id: 'demo',
  name: 'Demo Creator',
  display_name: 'Demo Creator',
  email: 'demo@vesperaworld.com',
  phone: null,
  platform: 'YouTube',
  status: 'active',
  avatar: null,
  monthly_revenue: null,
  revenue_change: null,
  subscribers: null,
  join_date: null,
  bio: null,
  vespera_slug: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const demoFiles: CreatorFile[] = [
  {
    id: '1',
    client_id: 'demo',
    storage_type: 'raw',
    file_name: 'brand-shoot-001.jpg',
    file_path: 'demo/brand-shoot-001.jpg',
    file_size: 2500000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'uploaded',
    file_type: 'image',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '2',
    client_id: 'demo',
    storage_type: 'raw',
    file_name: 'product-video.mp4',
    file_path: 'demo/product-video.mp4',
    file_size: 125000000,
    mime_type: 'video/mp4',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'processing',
    file_type: 'video',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: '3',
    client_id: 'demo',
    storage_type: 'raw',
    file_name: 'behind-scenes.jpg',
    file_path: 'demo/behind-scenes.jpg',
    file_size: 3100000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'uploaded',
    file_type: 'image',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: '4',
    client_id: 'demo',
    storage_type: 'completed',
    file_name: 'final-edit-001.jpg',
    file_path: 'demo/final-edit-001.jpg',
    file_size: 3200000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'completed',
    file_type: 'image',
    completed_path: 'demo/completed/final-edit-001.jpg',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: '5',
    client_id: 'demo',
    storage_type: 'completed',
    file_name: 'edited-promo.mp4',
    file_path: 'demo/edited-promo.mp4',
    file_size: 89000000,
    mime_type: 'video/mp4',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'completed',
    file_type: 'video',
    completed_path: 'demo/completed/edited-promo.mp4',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: '6',
    client_id: 'demo',
    storage_type: 'completed',
    file_name: 'thumbnail-final.jpg',
    file_path: 'demo/thumbnail-final.jpg',
    file_size: 1800000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo',
    status: 'completed',
    file_type: 'image',
    completed_path: 'demo/completed/thumbnail-final.jpg',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
]

const demoMarketplaceItems: MarketplaceItem[] = [
  {
    id: 'mp-1',
    client_id: 'demo',
    title: 'Premium Photo Bundle',
    description: 'A collection of 50 high-resolution lifestyle photos perfect for social media, blogs, and marketing materials.',
    price: 49.99,
    currency: 'USD',
    item_type: 'photo_pack',
    category: 'Lifestyle',
    keywords: ['lifestyle', 'social media', 'marketing', 'photos'],
    cover_image_url: null,
    preview_images: [],
    file_ids: [],
    stock_count: -1,
    sold_count: 127,
    is_published: true,
    is_featured: true,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'mp-2',
    client_id: 'demo',
    title: 'YouTube Intro Pack',
    description: 'Professional intro and outro video templates with customizable text and colors.',
    price: 29.99,
    currency: 'USD',
    item_type: 'video',
    category: 'Templates',
    keywords: ['youtube', 'intro', 'outro', 'video', 'template'],
    cover_image_url: null,
    preview_images: [],
    file_ids: [],
    stock_count: -1,
    sold_count: 89,
    is_published: true,
    is_featured: false,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'mp-3',
    client_id: 'demo',
    title: 'Creator Starter Bundle',
    description: 'Everything you need to start creating: templates, presets, and stock content.',
    price: 99.99,
    currency: 'USD',
    item_type: 'bundle',
    category: 'Bundles',
    keywords: ['starter', 'bundle', 'templates', 'presets'],
    cover_image_url: null,
    preview_images: [],
    file_ids: [],
    stock_count: 50,
    sold_count: 23,
    is_published: false,
    is_featured: false,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
]

const demoSocialContent: SocialMediaContent[] = [
  {
    id: 'sc-1',
    client_id: 'demo',
    title: 'Summer Vibes Post',
    description: 'Lifestyle post for summer campaign',
    platform: 'instagram',
    content_type: 'post',
    caption: 'Living my best life this summer! Who else is enjoying the sunshine?',
    hashtags: ['summer', 'lifestyle', 'vibes', 'sunshine', 'blessed'],
    file_ids: [],
    cover_image_url: null,
    scheduled_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    published_date: null,
    status: 'scheduled',
    engagement_stats: null,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'sc-2',
    client_id: 'demo',
    title: 'Dance Challenge',
    description: 'TikTok dance trend participation',
    platform: 'tiktok',
    content_type: 'short',
    caption: 'Trying the new viral dance! How did I do?',
    hashtags: ['dance', 'viral', 'trending', 'fyp'],
    file_ids: [],
    cover_image_url: null,
    scheduled_date: null,
    published_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'published',
    engagement_stats: { views: 45000, likes: 2300, shares: 120 },
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'sc-3',
    client_id: 'demo',
    title: 'Behind the Scenes',
    description: 'YouTube community post',
    platform: 'youtube',
    content_type: 'post',
    caption: 'Sneak peek of what we are working on! Full video coming next week.',
    hashtags: ['bts', 'behindthescenes', 'sneakpeek'],
    file_ids: [],
    cover_image_url: null,
    scheduled_date: null,
    published_date: null,
    status: 'draft',
    engagement_stats: null,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
]

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return (
      <ContentClient 
        files={demoFiles} 
        marketplaceItems={demoMarketplaceItems} 
        socialContent={demoSocialContent}
        client={demoClient} 
        isDemo 
      />
    )
  }

  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser || !portalUser.client_id) {
    return (
      <ContentClient 
        files={demoFiles} 
        marketplaceItems={demoMarketplaceItems} 
        socialContent={demoSocialContent}
        client={demoClient} 
        isDemo 
      />
    )
  }

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", portalUser.client_id)
    .single() as { data: Client | null }

  const { data: files } = await supabase
    .from("creator_files")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("created_at", { ascending: false }) as { data: CreatorFile[] | null }

  const { data: marketplaceItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("created_at", { ascending: false }) as { data: MarketplaceItem[] | null }

  const { data: socialContent } = await supabase
    .from("social_media_content")
    .select("*")
    .eq("client_id", portalUser.client_id)
    .order("created_at", { ascending: false }) as { data: SocialMediaContent[] | null }

  return (
    <ContentClient 
      files={files || []} 
      marketplaceItems={marketplaceItems || []}
      socialContent={socialContent || []}
      client={client} 
      userId={user.id} 
      clientId={portalUser.client_id} 
    />
  )
}
