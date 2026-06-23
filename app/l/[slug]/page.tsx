import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Creator, LinkHubLink } from "@/lib/types/database"
import { LinkHubPage } from "./link-hub-page"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCreatorAndLinks(slug: string): Promise<{ creator: Creator; links: LinkHubLink[] } | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  // Try slug first, then handle
  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .or(`slug.eq.${slug},handle.eq.${slug}`)
    .single() as { data: Creator | null }

  if (!creator) return null

  // Also try matching by creator_handle on link_hub_links
  const { data: links } = await supabase
    .from("link_hub_links")
    .select("*")
    .eq("creator_id", creator.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("position", { ascending: true }) as { data: LinkHubLink[] | null }

  return { creator, links: links || [] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getCreatorAndLinks(slug)

  if (!result) {
    return { title: "Not Found | Vespera World" }
  }

  const { creator } = result
  const name = creator.display_name || creator.name

  return {
    title: `${name} | Vespera World`,
    description: creator.bio || `Follow ${name} on Vespera World`,
    openGraph: {
      title: `${name} | Vespera World`,
      description: creator.bio || `Follow ${name} on Vespera World`,
      images: creator.avatar_url ? [creator.avatar_url] : [],
    },
  }
}

export default async function PublicLinkHubPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getCreatorAndLinks(slug)

  if (!result) {
    notFound()
  }

  return <LinkHubPage creator={result.creator} links={result.links} />
}
