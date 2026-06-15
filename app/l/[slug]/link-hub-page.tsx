"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ExternalLink, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Creator, LinkHubLink } from "@/lib/types/database"

interface LinkHubPageProps {
  creator: Creator
  links: LinkHubLink[]
}

function getLinkMeta(iconStr: string | null, title: string): { icon: string; bg: string; border: string; text: string; glow: string } {
  const lower = (iconStr || title || "").toLowerCase()

  if (lower.includes("youtube"))
    return { icon: "▶", bg: "oklch(0.35 0.15 25 / 0.15)", border: "oklch(0.6 0.2 25 / 0.35)", text: "oklch(0.7 0.2 25)", glow: "oklch(0.5 0.2 25 / 0.25)" }
  if (lower.includes("instagram"))
    return { icon: "◈", bg: "oklch(0.35 0.15 330 / 0.15)", border: "oklch(0.6 0.18 330 / 0.35)", text: "oklch(0.72 0.18 330)", glow: "oklch(0.5 0.18 330 / 0.25)" }
  if (lower.includes("tiktok"))
    return { icon: "♪", bg: "oklch(0.3 0.1 200 / 0.15)", border: "oklch(0.65 0.15 200 / 0.35)", text: "oklch(0.75 0.15 200)", glow: "oklch(0.55 0.15 200 / 0.25)" }
  if (lower.includes("twitter") || lower.includes("x "))
    return { icon: "𝕏", bg: "oklch(0.25 0.02 270 / 0.2)", border: "oklch(0.5 0.02 270 / 0.3)", text: "oklch(0.85 0.01 270)", glow: "oklch(0.5 0.02 270 / 0.2)" }
  if (lower.includes("onlyfans"))
    return { icon: "✦", bg: "oklch(0.3 0.1 220 / 0.15)", border: "oklch(0.6 0.15 220 / 0.35)", text: "oklch(0.7 0.15 220)", glow: "oklch(0.5 0.15 220 / 0.25)" }
  if (lower.includes("fansly"))
    return { icon: "★", bg: "oklch(0.3 0.12 260 / 0.15)", border: "oklch(0.6 0.18 260 / 0.35)", text: "oklch(0.7 0.18 260)", glow: "oklch(0.5 0.18 260 / 0.25)" }
  if (lower.includes("telegram"))
    return { icon: "✈", bg: "oklch(0.3 0.1 230 / 0.15)", border: "oklch(0.6 0.15 230 / 0.35)", text: "oklch(0.7 0.15 230)", glow: "oklch(0.5 0.15 230 / 0.25)" }
  if (lower.includes("discord"))
    return { icon: "◎", bg: "oklch(0.3 0.12 270 / 0.15)", border: "oklch(0.55 0.2 270 / 0.35)", text: "oklch(0.65 0.2 270)", glow: "oklch(0.5 0.2 270 / 0.25)" }
  if (lower.includes("spotify"))
    return { icon: "♫", bg: "oklch(0.3 0.1 145 / 0.15)", border: "oklch(0.65 0.2 145 / 0.35)", text: "oklch(0.7 0.2 145)", glow: "oklch(0.5 0.2 145 / 0.25)" }
  if (lower.includes("shop") || lower.includes("store") || lower.includes("merch"))
    return { icon: "◈", bg: "oklch(0.35 0.12 85 / 0.15)", border: "oklch(0.7 0.15 85 / 0.35)", text: "oklch(0.8 0.15 85)", glow: "oklch(0.6 0.15 85 / 0.25)" }

  // Default: purple/gold brand
  return { icon: "◆", bg: "oklch(0.3 0.12 300 / 0.15)", border: "oklch(0.55 0.2 300 / 0.35)", text: "oklch(0.65 0.18 300)", glow: "oklch(0.45 0.2 300 / 0.25)" }
}

function LinkCard({ link }: { link: LinkHubLink }) {
  const [clicked, setClicked] = useState(false)
  const [localClicks, setLocalClicks] = useState(link.click_count || link.clicks || 0)
  const meta = getLinkMeta(link.icon, link.title)

  const handleClick = useCallback(async () => {
    if (clicked) return
    setClicked(true)
    setLocalClicks(c => c + 1)

    // Fire-and-forget click tracking
    fetch(`/api/links/${link.id}/click`, { method: "POST" }).catch(() => {})
  }, [clicked, link.id])

  return (
    <a
      href={link.Vespera_Link_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300",
        "hover:-translate-y-0.5 active:scale-[0.98]",
      )}
      style={{
        background: `linear-gradient(135deg, ${meta.bg}, oklch(0.08 0.015 270 / 0.4))`,
        border: `1px solid ${meta.border}`,
        boxShadow: `0 4px 20px oklch(0 0 0 / 0.2)`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${meta.glow}, 0 4px 20px oklch(0 0 0 / 0.3)`
        ;(e.currentTarget as HTMLElement).style.borderColor = meta.text
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px oklch(0 0 0 / 0.2)`
        ;(e.currentTarget as HTMLElement).style.borderColor = meta.border
      }}
    >
      {/* Icon badge */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          color: meta.text,
          boxShadow: `0 0 12px ${meta.glow}`,
        }}
      >
        {meta.icon}
      </div>

      {/* Title + URL */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-semibold text-sm leading-tight"
            style={{ color: "oklch(0.95 0.01 90)" }}
          >
            {link.title}
          </span>
          {link.is_featured && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: "oklch(0.75 0.15 85 / 0.15)",
                color: "oklch(0.85 0.12 85)",
                border: "1px solid oklch(0.75 0.15 85 / 0.3)",
              }}
            >
              <Star className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          {link.price && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: "oklch(0.65 0.2 145 / 0.15)",
                color: "oklch(0.75 0.18 145)",
                border: "1px solid oklch(0.65 0.2 145 / 0.3)",
              }}
            >
              ${link.price}
            </span>
          )}
        </div>
        {localClicks > 0 && (
          <p
            className="text-[11px] mt-0.5 transition-colors"
            style={{ color: "oklch(0.55 0.02 270)" }}
          >
            {localClicks.toLocaleString()} clicks
          </p>
        )}
      </div>

      {/* Arrow */}
      <ExternalLink
        className="h-4 w-4 shrink-0 transition-all duration-300 opacity-40 group-hover:opacity-100"
        style={{ color: meta.text }}
      />
    </a>
  )
}

export function LinkHubPage({ creator, links }: LinkHubPageProps) {
  const name = creator.display_name || creator.name
  const handle = creator.slug || creator.handle
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "VW"

  const featuredLinks = links.filter(l => l.is_featured)
  const regularLinks = links.filter(l => !l.is_featured)

  return (
    <div
      className="min-h-screen w-full font-sans antialiased"
      style={{ background: "oklch(0.07 0.015 270)" }}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.2 300 / 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, oklch(0.75 0.15 85 / 0.3) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Page content */}
      <main className="relative z-10 flex flex-col items-center min-h-screen px-4 py-12 pb-20">
        {/* Avatar + Name section */}
        <header className="flex flex-col items-center text-center mb-8 w-full max-w-md">
          {/* Avatar */}
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.2 300) 0%, oklch(0.75 0.15 85) 100%)",
                boxShadow: "0 0 40px oklch(0.55 0.2 300 / 0.4), 0 0 80px oklch(0.75 0.15 85 / 0.2)",
              }}
            >
              {creator.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={name || "Creator"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <span style={{ color: "oklch(0.95 0.01 90)" }}>{initials}</span>
              )}
            </div>
            {/* Online indicator */}
            <div
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full"
              style={{
                background: "oklch(0.65 0.2 145)",
                boxShadow: "0 0 8px oklch(0.65 0.2 145 / 0.8)",
                border: "2px solid oklch(0.07 0.015 270)",
              }}
            />
          </div>

          {/* Name */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "oklch(0.96 0.01 90)" }}
          >
            {name}
          </h1>

          {/* Handle */}
          {handle && (
            <p
              className="text-sm font-medium mb-3"
              style={{ color: "oklch(0.55 0.2 300)" }}
            >
              @{handle}
            </p>
          )}

          {/* Bio */}
          {creator.bio && (
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "oklch(0.65 0.02 270)" }}
            >
              {creator.bio}
            </p>
          )}

          {/* Divider */}
          <div
            className="mt-6 w-16 h-px rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, oklch(0.55 0.2 300 / 0.6), transparent)",
            }}
          />
        </header>

        {/* Links */}
        <div className="w-full max-w-md space-y-3">
          {links.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{
                background: "oklch(0.1 0.02 270 / 0.5)",
                border: "1px solid oklch(0.25 0.03 270 / 0.4)",
              }}
            >
              <p style={{ color: "oklch(0.5 0.02 270)" }} className="text-sm">
                No links published yet.
              </p>
            </div>
          ) : (
            <>
              {/* Featured section */}
              {featuredLinks.length > 0 && (
                <div className="space-y-3 mb-2">
                  <p
                    className="text-[10px] uppercase tracking-[0.2em] font-semibold text-center"
                    style={{ color: "oklch(0.75 0.15 85 / 0.7)" }}
                  >
                    Featured
                  </p>
                  {featuredLinks.map(link => (
                    <LinkCard key={link.id} link={link} />
                  ))}
                </div>
              )}

              {/* Regular links */}
              {regularLinks.length > 0 && (
                <div className="space-y-3">
                  {featuredLinks.length > 0 && (
                    <div
                      className="h-px w-full rounded-full my-4"
                      style={{
                        background: "linear-gradient(90deg, transparent, oklch(0.3 0.03 270 / 0.5), transparent)",
                      }}
                    />
                  )}
                  {regularLinks.map(link => (
                    <LinkCard key={link.id} link={link} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer branding */}
        <footer className="mt-12 flex flex-col items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium"
              style={{
                background: "oklch(0.1 0.02 270 / 0.6)",
                border: "1px solid oklch(0.25 0.03 270 / 0.4)",
                color: "oklch(0.6 0.02 270)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Zap
                className="h-3 w-3"
                style={{ color: "oklch(0.75 0.15 85)" }}
              />
              <span>
                Powered by{" "}
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.75 0.15 85)" }}
                >
                  Vespera World
                </span>
              </span>
            </div>
          </a>
        </footer>
      </main>
    </div>
  )
}
