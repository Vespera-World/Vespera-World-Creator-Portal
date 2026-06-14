import { createClient } from "@/lib/supabase/server"
import { AdminContentClient } from "./content-client"
import type { CreatorFile, Client, CreatorPortalUser, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

// Demo data
const demoClients: Client[] = [
  {
    id: 'demo-1',
    name: 'Alex Johnson',
    display_name: 'Alex Johnson',
    email: 'alex@vesperaworld.com',
    phone: null,
    platform: 'YouTube',
    status: 'active',
    avatar: null,
    monthly_revenue: 12500,
    revenue_change: 15,
    subscribers: 125000,
    join_date: '2024-01-15',
    bio: null,
    vespera_slug: 'alexj',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    name: 'Sarah Chen',
    display_name: 'Sarah Chen',
    email: 'sarah@vesperaworld.com',
    phone: null,
    platform: 'TikTok',
    status: 'active',
    avatar: null,
    monthly_revenue: 8200,
    revenue_change: 22,
    subscribers: 450000,
    join_date: '2024-02-20',
    bio: null,
    vespera_slug: 'sarahc',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
]

const demoFiles: (CreatorFile & { client?: Client })[] = [
  {
    id: '1',
    client_id: 'demo-1',
    storage_type: 'raw',
    file_name: 'brand-shoot-001.jpg',
    file_path: 'demo-1/brand-shoot-001.jpg',
    file_size: 2500000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo-1',
    status: 'uploaded',
    file_type: 'image',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    client: demoClients[0]
  },
  {
    id: '2',
    client_id: 'demo-2',
    storage_type: 'raw',
    file_name: 'tiktok-collab.mp4',
    file_path: 'demo-2/tiktok-collab.mp4',
    file_size: 89000000,
    mime_type: 'video/mp4',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo-2',
    status: 'processing',
    file_type: 'video',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    client: demoClients[1]
  },
  {
    id: '3',
    client_id: 'demo-1',
    storage_type: 'completed',
    file_name: 'final-edit-001.jpg',
    file_path: 'demo-1/final-edit-001.jpg',
    file_size: 3200000,
    mime_type: 'image/jpeg',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo-1',
    status: 'completed',
    file_type: 'image',
    completed_path: 'demo-1/completed/final-edit-001.jpg',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    client: demoClients[0]
  },
  {
    id: '4',
    client_id: 'demo-2',
    storage_type: 'completed',
    file_name: 'edited-promo.mp4',
    file_path: 'demo-2/edited-promo.mp4',
    file_size: 125000000,
    mime_type: 'video/mp4',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo-2',
    status: 'completed',
    file_type: 'video',
    completed_path: 'demo-2/completed/edited-promo.mp4',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    client: demoClients[1]
  },
  {
    id: '5',
    client_id: 'demo-1',
    storage_type: 'raw',
    file_name: 'contract-2024.pdf',
    file_path: 'demo-1/contract-2024.pdf',
    file_size: 450000,
    mime_type: 'application/pdf',
    blob_url: null,
    thumbnail_url: null,
    metadata: null,
    uploaded_by: 'demo-1',
    status: 'uploaded',
    file_type: 'document',
    completed_path: null,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    client: demoClients[0]
  },
]

const demoMarketplaceItems: (MarketplaceItem & { client?: Client })[] = [
  {
    id: 'mp-1',
    client_id: 'demo-1',
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
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    client: demoClients[0]
  },
  {
    id: 'mp-2',
    client_id: 'demo-1',
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
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    client: demoClients[0]
  },
  {
    id: 'mp-3',
    client_id: 'demo-2',
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
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    client: demoClients[1]
  },
  {
    id: 'mp-4',
    client_id: 'demo-2',
    title: 'Dance Tutorial Series',
    description: 'Complete 10-part dance tutorial series for beginners.',
    price: 79.99,
    currency: 'USD',
    item_type: 'video',
    category: 'Tutorials',
    keywords: ['dance', 'tutorial', 'beginner', 'tiktok'],
    cover_image_url: null,
    preview_images: [],
    file_ids: [],
    stock_count: -1,
    sold_count: 234,
    is_published: true,
    is_featured: true,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    client: demoClients[1]
  },
]

const demoSocialContent: (SocialMediaContent & { client?: Client })[] = [
  {
    id: 'social-1',
    client_id: 'demo-1',
    title: 'Weekly Vlog Announcement',
    caption: 'Excited to share my latest adventure! Check out my new vlog where I explore hidden gems in the city. Link in bio! 🌟',
    platform: 'instagram',
    content_type: 'reel',
    status: 'published',
    scheduled_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    published_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    hashtags: ['vlog', 'adventure', 'citylife', 'explore'],
    media_urls: [],
    file_ids: [],
    engagement_metrics: { likes: 2450, comments: 89, shares: 34 },
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    client: demoClients[0]
  },
  {
    id: 'social-2',
    client_id: 'demo-1',
    title: 'Product Launch Teaser',
    caption: 'Something BIG is coming next week... 👀 Stay tuned for the reveal!',
    platform: 'tiktok',
    content_type: 'video',
    status: 'scheduled',
    scheduled_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    published_date: null,
    hashtags: ['teaser', 'comingsoon', 'newproduct'],
    media_urls: [],
    file_ids: [],
    engagement_metrics: null,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    client: demoClients[0]
  },
  {
    id: 'social-3',
    client_id: 'demo-2',
    title: 'Dance Challenge',
    caption: 'Try this new dance challenge! Tag me in your videos 💃',
    platform: 'tiktok',
    content_type: 'video',
    status: 'published',
    scheduled_date: new Date(Date.now() - 86400000 * 7).toISOString(),
    published_date: new Date(Date.now() - 86400000 * 7).toISOString(),
    hashtags: ['dancechallenge', 'viral', 'dance', 'fyp'],
    media_urls: [],
    file_ids: [],
    engagement_metrics: { likes: 15670, comments: 892, shares: 2341 },
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    client: demoClients[1]
  },
  {
    id: 'social-4',
    client_id: 'demo-2',
    title: 'Behind the Scenes',
    caption: 'A glimpse into my creative process ✨',
    platform: 'instagram',
    content_type: 'story',
    status: 'draft',
    scheduled_date: null,
    published_date: null,
    hashtags: ['behindthescenes', 'creative', 'process'],
    media_urls: [],
    file_ids: [],
    engagement_metrics: null,
    metadata: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    client: demoClients[1]
  },
]

export default async function AdminContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Demo mode
  if (!user) {
    return (
      <AdminContentClient 
        files={demoFiles} 
        marketplaceItems={demoMarketplaceItems} 
        socialContent={demoSocialContent}
        clients={demoClients} 
        isDemo 
      />
    )
  }

  // Check if user is admin
  const { data: portalUser } = await supabase
    .from("creator_portal_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single() as { data: CreatorPortalUser | null }

  if (!portalUser || portalUser.role !== 'admin') {
    return (
      <AdminContentClient 
        files={demoFiles} 
        marketplaceItems={demoMarketplaceItems} 
        socialContent={demoSocialContent}
        clients={demoClients} 
        isDemo 
      />
    )
  }

  // Fetch all clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name") as { data: Client[] | null }

  // Fetch all files
  const { data: files } = await supabase
    .from("creator_files")
    .select("*")
    .order("created_at", { ascending: false }) as { data: CreatorFile[] | null }

  // Fetch all marketplace items
  const { data: marketplaceItems } = await supabase
    .from("marketplace_items")
    .select("*")
    .order("created_at", { ascending: false }) as { data: MarketplaceItem[] | null }

  // Fetch all social media content
  const { data: socialContent } = await supabase
    .from("social_media_content")
    .select("*")
    .order("created_at", { ascending: false }) as { data: SocialMediaContent[] | null }

  // Join files with clients
  const filesWithClients = (files || []).map(file => ({
    ...file,
    client: (clients || []).find(c => c.id === file.client_id)
  }))

  // Join marketplace items with clients
  const marketplaceWithClients = (marketplaceItems || []).map(item => ({
    ...item,
    client: (clients || []).find(c => c.id === item.client_id)
  }))

  // Join social content with clients
  const socialWithClients = (socialContent || []).map(content => ({
    ...content,
    client: (clients || []).find(c => c.id === content.client_id)
  }))

  return (
    <AdminContentClient 
      files={filesWithClients} 
      marketplaceItems={marketplaceWithClients}
      socialContent={socialWithClients}
      clients={clients || []} 
    />
  )
}
