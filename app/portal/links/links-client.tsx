"use client"

import {
  Link as LinkIcon,
  ExternalLink,
  Eye,
  MousePointer,
  Globe,
  Copy,
  Check,
  Star,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { LinkHubLink, Client } from "@/lib/types/database"

interface LinksClientProps {
  links: LinkHubLink[]
  client: Client | null
  isDemo?: boolean
}

export function LinksClient({ links, client, isDemo }: LinksClientProps) {
  const [copied, setCopied] = useState(false)
  
  const vesperaSlug = client?.vespera_slug
  const profileUrl = vesperaSlug ? `https://vespera.link/${vesperaSlug}` : null

  const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0)
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || link.click_count || 0), 0)
  const featuredLinks = links.filter(link => link.is_featured)
  const activeLinks = links.filter(link => link.is_active)

  const handleCopyLink = async () => {
    if (profileUrl) {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-purple">Link Hub</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your Vespera.link profile and track link performance.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple to-gold flex items-center justify-center">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{client?.display_name || client?.name || 'Your Profile'}</h2>
              {profileUrl ? (
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:text-purple-light transition-colors"
                  >
                    {profileUrl}
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="p-1 rounded hover:bg-muted/30 transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  No Vespera.link profile configured yet
                </p>
              )}
            </div>
          </div>
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-purple flex items-center gap-2"
            >
              View Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10">
              <LinkIcon className="h-4 w-4 text-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeLinks.length}</p>
              <p className="text-xs text-muted-foreground">Active Links</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Star className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{featuredLinks.length}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Eye className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10">
              <MousePointer className="h-4 w-4 text-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links List */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Your Links</h2>
        
        {links.length === 0 ? (
          <div className="text-center py-12">
            <LinkIcon className="h-16 w-16 text-purple/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No links yet</h3>
            <p className="text-muted-foreground">
              Your links will appear here once configured by your team.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div 
                key={link.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  link.is_active 
                    ? "bg-muted/20 hover:bg-muted/30" 
                    : "bg-muted/10 opacity-60"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg shrink-0",
                  link.is_featured ? "bg-gold/10" : "bg-purple/10"
                )}>
                  {link.is_featured ? (
                    <Star className="h-5 w-5 text-gold" />
                  ) : (
                    <LinkIcon className="h-5 w-5 text-purple" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{link.title}</h3>
                    {link.is_featured && (
                      <span className="pill-gold">Featured</span>
                    )}
                    {!link.is_active && (
                      <span className="pill-purple">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {link.Vespera_Link_URL}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {link.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-3 w-3" />
                      {link.clicks || link.click_count || 0} clicks
                    </span>
                    {link.type && (
                      <span className="capitalize">{link.type}</span>
                    )}
                  </div>
                </div>
                <a
                  href={link.Vespera_Link_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-purple/10 text-purple hover:bg-purple/20 transition-colors shrink-0"
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
