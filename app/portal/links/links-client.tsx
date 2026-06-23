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
  TrendingUp,
  Smartphone,
  BarChart2,
  Zap,
  ArrowUpRight,
  Share2,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { LinkHubLink, Creator } from "@/lib/types/database"

interface LinksClientProps {
  links: LinkHubLink[]
  creator: Creator | null
  isDemo?: boolean
}

// Map icon string -> lucide or emoji representation
function getLinkIcon(iconStr: string | null, title: string) {
  const lower = (iconStr || title || "").toLowerCase()
  if (lower.includes("youtube")) return "▶"
  if (lower.includes("instagram")) return "◈"
  if (lower.includes("tiktok")) return "♪"
  if (lower.includes("twitter") || lower.includes("x ")) return "𝕏"
  if (lower.includes("onlyfans")) return "✦"
  if (lower.includes("fansly")) return "★"
  if (lower.includes("telegram")) return "✈"
  if (lower.includes("discord")) return "◎"
  if (lower.includes("shop") || lower.includes("store") || lower.includes("merch")) return "◈"
  if (lower.includes("spotify")) return "♫"
  if (lower.includes("link") || lower.includes("bio")) return "⊕"
  return "◆"
}

function getLinkColor(iconStr: string | null, title: string) {
  const lower = (iconStr || title || "").toLowerCase()
  if (lower.includes("youtube")) return "from-red-600/20 to-red-900/10 border-red-600/20 text-red-400"
  if (lower.includes("instagram")) return "from-pink-600/20 to-purple-900/10 border-pink-500/20 text-pink-400"
  if (lower.includes("tiktok")) return "from-cyan-600/20 to-slate-900/10 border-cyan-500/20 text-cyan-400"
  if (lower.includes("twitter") || lower.includes("x ")) return "from-slate-600/20 to-slate-900/10 border-slate-500/20 text-slate-300"
  if (lower.includes("onlyfans")) return "from-blue-600/20 to-blue-900/10 border-blue-500/20 text-blue-400"
  if (lower.includes("fansly")) return "from-indigo-600/20 to-indigo-900/10 border-indigo-500/20 text-indigo-400"
  if (lower.includes("spotify")) return "from-green-600/20 to-green-900/10 border-green-500/20 text-green-400"
  return "from-purple/20 to-purple-dark/10 border-purple/20 text-purple-light"
}

export function LinksClient({ links, creator, isDemo }: LinksClientProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"links" | "analytics">("links")
  
  const profileSlug = creator?.slug || creator?.handle
  // Use internal /l/[slug] route; the external vespera.link domain resolves there in prod
  const profileUrl = profileSlug ? `/l/${profileSlug}` : null
  const profileUrlDisplay = profileSlug ? `vespera.link/${profileSlug}` : null

  const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0)
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || link.click_count || 0), 0)
  const featuredLinks = links.filter(link => link.is_featured)
  const activeLinks = links.filter(link => link.is_active)
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0"

  const handleCopyLink = async () => {
    if (profileUrl) {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const initials = creator?.display_name
    ? creator.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : creator?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'VW'

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-purple">Link Hub</span>
        </h1>
        <p className="text-muted-foreground">
          Your Vespera.link profile and link performance at a glance.
        </p>
      </div>

      {/* Main layout: left panel + right phone preview */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        
        {/* Left Panel */}
        <div className="space-y-5">
          
          {/* Profile Card */}
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-gold flex items-center justify-center text-lg font-bold text-white">
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-background" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {creator?.display_name || creator?.name || 'Your Profile'}
                  </h2>
                  {profileUrl ? (
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple hover:text-purple-light transition-colors flex items-center gap-1"
                      >
                        vespera.link/{profileSlug}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="p-1 rounded hover:bg-muted/30 transition-colors"
                        title="Copy link"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      No profile URL configured yet
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {profileUrl && (
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-purple flex items-center gap-2 text-sm !px-4 !py-2"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share Profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple/10 shrink-0">
                  <LinkIcon className="h-4 w-4 text-purple" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight">{activeLinks.length}</p>
                  <p className="text-xs text-muted-foreground">Active Links</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gold/10 shrink-0">
                  <Star className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight">{featuredLinks.length}</p>
                  <p className="text-xs text-muted-foreground">Featured</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-success/10 shrink-0">
                  <Eye className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple/10 shrink-0">
                  <MousePointer className="h-4 w-4 text-purple" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight">{totalClicks.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="glass-card p-1 flex gap-1 w-fit">
            <button
              onClick={() => setActiveTab("links")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "links"
                  ? "bg-purple/20 text-foreground border border-purple/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5" />
                Links
              </span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "analytics"
                  ? "bg-gold/20 text-foreground border border-gold/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <BarChart2 className="h-3.5 w-3.5" />
                Analytics
              </span>
            </button>
          </div>

          {/* Links List */}
          {activeTab === "links" && (
            <div className="space-y-2">
              {links.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-purple/10 flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="h-8 w-8 text-purple/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No links yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Your Vespera.link profile links will appear here once configured by your team.
                  </p>
                </div>
              ) : (
                links.map((link) => {
                  const iconChar = getLinkIcon(link.icon, link.title)
                  const colorClass = getLinkColor(link.icon, link.title)
                  const linkClicks = link.clicks || link.click_count || 0
                  const linkViews = link.views || 0
                  const linkCtr = linkViews > 0 ? ((linkClicks / linkViews) * 100).toFixed(1) : "—"
                  
                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "glass-card-hover p-4 flex items-center gap-4 group",
                        !link.is_active && "opacity-50"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold bg-gradient-to-br border shrink-0",
                        colorClass
                      )}>
                        {iconChar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="font-medium truncate">{link.title}</span>
                          {link.is_featured && (
                            <span className="pill-gold !py-0.5">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              Featured
                            </span>
                          )}
                          {!link.is_active && (
                            <span className="pill-purple !py-0.5">Inactive</span>
                          )}
                          {link.type && (
                            <span className="pill !py-0.5 !px-2 bg-muted/30 text-muted-foreground capitalize text-[10px]">
                              {link.type}
                            </span>
                          )}
                          {link.price && (
                            <span className="pill-success !py-0.5">
                              ${link.price}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.Vespera_Link_URL}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {linkViews.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            {linkClicks.toLocaleString()} clicks
                          </span>
                          <span className="flex items-center gap-1 text-gold">
                            <TrendingUp className="h-3 w-3" />
                            {linkCtr}% CTR
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {totalClicks > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-20">
                          <span className="text-xs text-muted-foreground">
                            {totalClicks > 0 ? Math.round((linkClicks / totalClicks) * 100) : 0}%
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-muted/30">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
                              style={{
                                width: `${totalClicks > 0 ? Math.min(100, Math.round((linkClicks / totalClicks) * 100)) : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Open link button */}
                      <a
                        href={link.Vespera_Link_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-purple/10 text-purple hover:bg-purple/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Performance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-gold">{totalViews.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-purple">{totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'oklch(0.65 0.2 145)' }}>{ctr}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg. CTR</p>
                  </div>
                </div>
              </div>

              {/* Per-link breakdown */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Link Breakdown</h3>
                {links.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No links to analyze yet.</p>
                ) : (
                  <div className="space-y-3">
                    {[...links]
                      .sort((a, b) => (b.clicks || b.click_count || 0) - (a.clicks || a.click_count || 0))
                      .map((link) => {
                        const linkClicks = link.clicks || link.click_count || 0
                        const pct = totalClicks > 0 ? Math.round((linkClicks / totalClicks) * 100) : 0
                        return (
                          <div key={link.id} className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br border shrink-0",
                              getLinkColor(link.icon, link.title)
                            )}>
                              {getLinkIcon(link.icon, link.title)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium truncate">{link.title}</span>
                                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                  {linkClicks.toLocaleString()} clicks
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted/30">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-purple to-gold transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gold w-8 text-right">{pct}%</span>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Phone Mockup */}
        <div className="hidden xl:flex flex-col items-center gap-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5" />
            Profile Preview
          </p>

          {/* Phone frame */}
          <div className="relative w-[280px]">
            {/* Phone bezel */}
            <div
              className="relative rounded-[2.5rem] p-1.5 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, oklch(0.25 0.03 270) 0%, oklch(0.12 0.02 270) 100%)',
                border: '1px solid oklch(0.3 0.03 270 / 0.5)',
              }}
            >
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-background z-10" />
              
              {/* Screen */}
              <div
                className="rounded-[2.2rem] overflow-hidden scrollbar-vespera"
                style={{
                  height: '580px',
                  background: 'oklch(0.06 0.015 270)',
                  overflowY: 'auto',
                }}
              >
                {/* Profile Header */}
                <div className="relative pt-12 pb-6 px-5 text-center">
                  {/* BG glow */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 0%, oklch(0.55 0.2 300 / 0.2) 0%, transparent 70%)'
                    }}
                  />
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple to-gold flex items-center justify-center text-lg font-bold text-white mx-auto mb-3 shadow-lg"
                      style={{ boxShadow: '0 0 20px oklch(0.55 0.2 300 / 0.4)' }}
                    >
                      {initials}
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {creator?.display_name || creator?.name || 'Your Name'}
                    </h3>
                    {profileSlug && (
                      <p className="text-xs text-purple mt-0.5">@{profileSlug}</p>
                    )}
                    {creator?.bio && (
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        {creator.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Links in phone */}
                <div className="px-4 pb-8 space-y-2.5">
                  {links.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">No links yet</p>
                    </div>
                  ) : (
                    links
                      .filter(l => l.is_active)
                      .map((link) => {
                        const colorClass = getLinkColor(link.icon, link.title)
                        const iconChar = getLinkIcon(link.icon, link.title)
                        return (
                          <div
                            key={link.id}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-gradient-to-r transition-all cursor-default",
                              colorClass,
                              link.is_featured && "ring-1 ring-gold/30"
                            )}
                            style={{ background: undefined }}
                          >
                            <span className="text-base w-6 text-center shrink-0">{iconChar}</span>
                            <span className="text-xs font-semibold flex-1 text-foreground truncate">{link.title}</span>
                            {link.is_featured && (
                              <Star className="h-3 w-3 text-gold shrink-0" />
                            )}
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          </div>
                        )
                      })
                  )}

                  {/* Powered by footer */}
                  <div className="pt-4 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 flex items-center justify-center gap-1">
                      <Zap className="h-2.5 w-2.5" />
                      Powered by Vespera World
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection/glow under phone */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-xl rounded-full opacity-30"
              style={{ background: 'linear-gradient(90deg, oklch(0.55 0.2 300), oklch(0.75 0.15 85))' }}
            />
          </div>

          {/* CTA below phone */}
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold flex items-center gap-2 text-sm !px-5 !py-2.5 mt-2"
            >
              <Globe className="h-4 w-4" />
              View Live Profile
            </a>
          )}
          
          <p className="text-xs text-muted-foreground text-center max-w-[200px] leading-relaxed">
            This is how your profile appears to visitors at{' '}
            <span className="text-purple">vespera.link/{profileSlug || '...'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
