'use client'

import {
  Instagram,
  Twitter,
  Youtube,
  Music2,
  Globe,
  Mail,
  Phone,
  Heart,
  Link as LinkIcon,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  tiktok: Music2,
  onlyfans: Heart,
  fansly: Heart,
  facebook: Globe,
  website: Globe,
  email: Mail,
  phone: Phone,
  web: Globe,
  link: LinkIcon,
}

function getIcon(platform: string): LucideIcon {
  const key = platform.toLowerCase().trim()
  return SOCIAL_ICONS[key] || LinkIcon
}

function isMature(platform: string): boolean {
  return ['onlyfans', 'fansly'].includes(platform.toLowerCase().trim())
}

interface SocialItem {
  id?: string
  title: string
  url: string
  icon?: string | null
  is_featured?: boolean
  follower_count?: number | null
}

interface Props {
  links: SocialItem[]
  followerCounts?: Record<string, number>
  lustMode?: boolean
}

function formatFollowers(n: number | null | undefined): string {
  if (!n) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function SocialLinks({ links, followerCounts = {}, lustMode = false }: Props) {
  if (links.length === 0) {
    return (
      <p className="text-center text-zinc-500 text-sm">No links yet. Check back soon!</p>
    )
  }

  return (
    <div className="space-y-3">
      {links.map((link, idx) => {
        const Icon = getIcon(link.icon || link.title)
        const mature = isMature(link.icon || link.title)
        const followers = formatFollowers(followerCounts[link.icon || link.title] || link.follower_count)

        // Chrome/gold buttons with optional lust mode intensification
        const buttonClass = lustMode
          ? mature
            ? 'vespera-chrome-btn vespera-mature-lust'
            : 'vespera-chrome-btn'
          : mature
          ? 'vespera-chrome-btn vespera-mature'
          : 'vespera-chrome-btn'

        return (
          <a
            key={link.id || idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (link.id) {
                fetch('/api/track/link-click', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ link_id: link.id }),
                }).catch(() => {})
              }
            }}
            className={buttonClass}
          >
            <span className="vespera-chrome-content">
              <Icon className="vespera-link-icon h-5 w-5" />
              <span className="vespera-link-title">{link.title}</span>
              {followers && (
                <span className="vespera-link-followers">
                  · {followers}
                </span>
              )}
              {mature && (
                <span className={lustMode ? 'vespera-badge-18plus-lust' : 'vespera-badge-18plus'}>
                  18+
                </span>
              )}
              <ExternalLink className="vespera-link-external h-3.5 w-3.5" />
            </span>
          </a>
        )
      })}

      {/* Chrome button styles */}
      <style jsx>{`
        .vespera-chrome-btn {
          display: block;
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 0.875rem;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background:
            linear-gradient(135deg,
              rgba(251, 191, 36, 0.15) 0%,
              rgba(168, 85, 247, 0.1) 50%,
              rgba(251, 191, 36, 0.05) 100%
            ),
            rgba(20, 14, 30, 0.6);
          border: 1px solid rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(8px);
          box-shadow:
            inset 0 1px 0 0 rgba(251, 191, 36, 0.2),
            0 4px 16px -4px rgba(168, 85, 247, 0.3);
        }
        .vespera-chrome-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0) 70%,
            rgba(251, 191, 36, 0.15) 100%
          );
          pointer-events: none;
          opacity: 0.6;
        }
        .vespera-chrome-btn:hover {
          transform: translateY(-2px) scale(1.015);
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow:
            inset 0 1px 0 0 rgba(251, 191, 36, 0.4),
            0 8px 24px -4px rgba(251, 191, 36, 0.5),
            0 0 24px -8px rgba(168, 85, 247, 0.6);
        }
        .vespera-chrome-btn:hover::before {
          opacity: 1;
        }
        .vespera-chrome-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          font-weight: 700;
          color: #fde68a;
          letter-spacing: 0.01em;
          font-size: 0.95rem;
        }
        .vespera-link-icon {
          color: #fbbf24;
          filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
        }
        .vespera-link-title {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 16px rgba(251, 191, 36, 0.2);
        }
        .vespera-link-followers {
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(253, 230, 138, 0.7);
          text-transform: lowercase;
        }
        .vespera-link-external {
          color: rgba(253, 230, 138, 0.4);
        }
        .vespera-badge-18plus {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
          background: linear-gradient(135deg, #ec4899, #be185d);
          color: white;
          letter-spacing: 0.05em;
          box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
        }

        /* Mature (OnlyFans) variant in default mode */
        .vespera-mature {
          border-color: rgba(236, 72, 153, 0.5);
          background:
            linear-gradient(135deg,
              rgba(236, 72, 153, 0.18) 0%,
              rgba(168, 85, 247, 0.12) 50%,
              rgba(236, 72, 153, 0.08) 100%
            ),
            rgba(30, 10, 25, 0.7);
          box-shadow:
            inset 0 1px 0 0 rgba(236, 72, 153, 0.3),
            0 4px 20px -4px rgba(236, 72, 153, 0.4);
        }
        .vespera-mature .vespera-link-icon {
          color: #f472b6;
          filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.7));
        }
        .vespera-mature .vespera-link-title {
          background: linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #db2777 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 16px rgba(236, 72, 153, 0.3);
        }

        /* Lust mode intensifies everything */
        .vespera-mature-lust {
          border-color: rgba(217, 70, 239, 0.7);
          background:
            linear-gradient(135deg,
              rgba(217, 70, 239, 0.35) 0%,
              rgba(236, 72, 153, 0.25) 50%,
              rgba(190, 24, 93, 0.2) 100%
            ),
            rgba(40, 8, 30, 0.8);
          box-shadow:
            inset 0 1px 0 0 rgba(236, 72, 153, 0.5),
            0 0 32px -4px rgba(236, 72, 153, 0.7),
            0 0 48px -8px rgba(217, 70, 239, 0.5);
          animation: maturePulse 2s ease-in-out infinite;
        }
        @keyframes maturePulse {
          0%, 100% {
            box-shadow:
              inset 0 1px 0 0 rgba(236, 72, 153, 0.5),
              0 0 32px -4px rgba(236, 72, 153, 0.7),
              0 0 48px -8px rgba(217, 70, 239, 0.5);
          }
          50% {
            box-shadow:
              inset 0 1px 0 0 rgba(236, 72, 153, 0.7),
              0 0 48px -4px rgba(236, 72, 153, 0.9),
              0 0 64px -8px rgba(217, 70, 239, 0.7);
          }
        }
        .vespera-badge-18plus-lust {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
          background: linear-gradient(135deg, #ff1493, #c026d3);
          color: white;
          letter-spacing: 0.05em;
          box-shadow: 0 0 16px rgba(255, 20, 147, 0.8);
          animation: badgePulse 1.5s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

// Avatar component with fallback to initials
export function CreatorAvatar({
  src,
  name,
  initials,
  size = 'lg',
  lustMode = false,
}: {
  src?: string | null
  name: string
  initials: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  lustMode?: boolean
}) {
  const sizes = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl',
    xl: 'w-32 h-32 text-2xl',
  }

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full mx-auto object-cover border-2 ${
          lustMode
            ? 'border-pink-400/70 shadow-lg shadow-pink-500/40'
            : 'border-amber-300/60 shadow-lg shadow-amber-500/30'
        }`}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full mx-auto flex items-center justify-center font-extrabold border-2 ${
        lustMode
          ? 'bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-700 border-pink-300 text-white shadow-2xl shadow-pink-500/50'
          : 'bg-gradient-to-br from-amber-500 via-amber-600 to-purple-700 border-amber-300 text-white shadow-2xl shadow-amber-500/40'
      }`}
    >
      {initials}
    </div>
  )
}