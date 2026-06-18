/**
 * Public Vespera Link landing page
 * URL: /link/[handle]
 *
 * Renders a creator's link hub as a public bio/linktree-style page.
 * Server-side: fetches creator + links + follower counts
 * Client-side: handles lust mode toggle, animations, click tracking
 */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LinkPageClient } from './link-page-client'
import { LustModeToggle } from './lust-mode'

export const dynamic = 'force-dynamic'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('')
}

async function fetchLinkHubByHandle(handle: string) {
  const supabase = await createClient()

  // Try vespera_slug first, then handle
  let creator: any = null
  const { data: bySlug } = await supabase
    .from('creators')
    .select('id, name, handle, slug, bio, avatar_url, social_links, status')
    .eq('slug', handle)
    .eq('status', 'active')
    .maybeSingle()

  if (bySlug) {
    creator = bySlug
  } else {
    const { data: byHandle } = await supabase
      .from('creators')
      .select('id, name, handle, slug, bio, avatar_url, social_links, status')
      .eq('handle', handle)
      .eq('status', 'active')
      .maybeSingle()
    creator = byHandle
  }

  if (!creator) return null

  // Fetch active links (sync'd from creator_social_links)
  const { data: links } = await supabase
    .from('link_hub_links')
    .select('id, title, "Vespera_Link_URL", icon, position, is_featured, click_count, views, is_active')
    .eq('creator_id', creator.id)
    .eq('is_active', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  // Fetch follower counts from creator_social_links (where available)
  const { data: socials } = await supabase
    .from('creator_social_links')
    .select('platform, follower_count:Follower_Count')
    .eq('creator_id', creator.id)

  const followerCounts: Record<string, number> = {}
  for (const s of socials || []) {
    if (s.follower_count) {
      followerCounts[(s.platform || '').toLowerCase()] = s.follower_count
    }
  }

  return {
    creator: {
      id: creator.id,
      name: creator.name,
      handle: creator.handle,
      slug: creator.slug || handle,
      bio: creator.bio,
      avatar_url: creator.avatar_url,
      initials: getInitials(creator.name),
    },
    links: (links || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      url: l.Vespera_Link_URL,
      icon: l.icon,
      position: l.position || 0,
      is_featured: l.is_featured || false,
      click_count: l.click_count || 0,
      views: l.views || 0,
    })),
    followerCounts,
  }
}

export default async function PublicLinkPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const data = await fetchLinkHubByHandle(handle)

  if (!data) {
    notFound()
  }

  return (
    <>
      <LustModeToggle />
      <LinkPageClient
        creator={data.creator}
        links={data.links}
        followerCounts={data.followerCounts}
      />
    </>
  )
}