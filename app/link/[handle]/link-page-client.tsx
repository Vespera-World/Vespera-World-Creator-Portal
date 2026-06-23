'use client'

import { useEffect, useState } from 'react'
import { Heart, ExternalLink } from 'lucide-react'
import { useLustMode } from './lust-mode'
import { SocialLinks, CreatorAvatar } from './social-links'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string | null
  position: number
  is_featured: boolean
  click_count: number
  views: number
}

interface CreatorData {
  id: string
  name: string
  handle: string | null
  slug: string
  bio: string | null
  avatar_url: string | null
  initials: string
}

interface Props {
  creator: CreatorData
  links: LinkItem[]
  followerCounts: Record<string, number>
  pageTitle?: string
}

export function LinkPageClient({ creator, links, followerCounts, pageTitle }: Props) {
  const [lustMode] = useLustMode()
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; size: number; duration: number; delay: number }>>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!lustMode) {
      setHearts([])
      return
    }
    const newHearts = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 24,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 5,
    }))
    setHearts(newHearts)
  }, [lustMode])

  // Display the slug (social-style handle) as the primary name
  const displayName = creator.slug || creator.handle || creator.name

  return (
    <div className="vespera-link-page min-h-screen relative overflow-hidden bg-[#0a0612]">
      {/* Pearl logo watermark — large, faded, behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vespera-logo.png"
          alt=""
          aria-hidden="true"
          className={`w-[120vmin] h-[120vmin] object-contain transition-all duration-700 ${
            lustMode
              ? 'opacity-[0.04] blur-[1px]'
              : 'opacity-[0.03]'
          }`}
        />
      </div>

      {/* Pearl logo header — small, glowing */}
      <div className="relative z-10 flex justify-center pt-8 pb-2">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/vespera-logo.png"
            alt="Vespera World"
            className={`w-16 h-16 object-contain pearl-glow ${lustMode ? 'pearl-glow-lust' : ''}`}
          />
        </div>
      </div>

      {/* Floating hearts in lust mode */}
      {lustMode && (
        <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
          {hearts.map((h) => (
            <div
              key={h.id}
              className="absolute text-pink-400/40 animate-float-up"
              style={{
                left: `${h.left}%`,
                bottom: '-50px',
                fontSize: `${h.size}px`,
                animation: `floatUp ${h.duration}s linear infinite`,
                animationDelay: `${h.delay}s`,
              }}
            >
              <Heart className="fill-current" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pb-12 relative z-10">
        {/* Avatar with chromatic ring */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Chromatic glow ring */}
            <div
              className={`absolute inset-0 rounded-full blur-md transition-all duration-700 ${
                lustMode
                  ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-fuchsia-500 opacity-80 scale-110'
                  : 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 opacity-60 scale-105'
              }`}
              style={{ filter: 'blur(20px)' }}
            />
            <div className="relative">
              <CreatorAvatar
                src={creator.avatar_url}
                name={displayName}
                initials={creator.initials}
                size="xl"
                lustMode={lustMode}
              />
            </div>
          </div>

          {/* Handle name with chromatic aberration */}
          <h1
            className={`chromatic-text text-3xl font-extrabold mt-2 mb-1 ${
              lustMode ? 'chromatic-lust' : 'chromatic-default'
            }`}
            data-text={displayName}
          >
            <span className="chromatic-layer chromatic-r">{displayName}</span>
            <span className="chromatic-layer chromatic-g">{displayName}</span>
            <span className="chromatic-layer chromatic-b">{displayName}</span>
            <span className="chromatic-actual">{displayName}</span>
          </h1>

          {creator.handle && creator.name && creator.handle !== creator.name && (
            <p className={`text-xs uppercase tracking-[0.3em] mt-1 ${lustMode ? 'text-pink-300/60' : 'text-amber-300/70'}`}>
              {creator.name}
            </p>
          )}

          {/* Show real handle (@username style) if different from slug */}
          {creator.handle && creator.handle !== creator.slug && creator.handle !== creator.name && (
            <p className={`text-xs mt-0.5 ${lustMode ? 'text-pink-200/50' : 'text-amber-200/50'}`}>
              @{creator.handle}
            </p>
          )}

          {creator.bio && (
            <p className={`text-sm mt-3 max-w-sm mx-auto ${lustMode ? 'text-pink-100/70' : 'text-zinc-300/80'}`}>
              {creator.bio}
            </p>
          )}
        </div>

        {/* Vespera branding */}
        <a
          href="https://vesperaworld.com"
          className={`block mb-6 p-3 rounded-xl text-center transition-all duration-300 chrome-border ${
            lustMode
              ? 'bg-gradient-to-r from-pink-900/30 via-purple-900/30 to-fuchsia-900/30 hover:from-pink-900/50 hover:via-purple-900/50 hover:to-fuchsia-900/50'
              : 'bg-gradient-to-r from-amber-900/20 via-yellow-900/20 to-amber-900/20 hover:from-amber-900/40 hover:via-yellow-900/40 hover:to-amber-900/40'
          }`}
        >
          <p className={`text-xs font-bold tracking-[0.25em] uppercase ${lustMode ? 'text-pink-200' : 'text-amber-200'}`}>
            ✨ Powered by{' '}
            <span className={lustMode ? 'chromatic-text chromatic-lust' : 'gold-text'}>
              {pageTitle || 'Vespera World'}
            </span>
          </p>
        </a>

        {/* Links — gold/chrome buttons */}
        <SocialLinks links={links} followerCounts={followerCounts} lustMode={lustMode} />

        {/* Footer */}
        <p className={`text-center text-xs mt-12 tracking-[0.3em] uppercase ${lustMode ? 'text-pink-300/30' : 'text-amber-300/30'}`}>
          vesperaworld.com
        </p>
      </div>

      {/* Pearl logo footer accent */}
      <div className="relative z-10 flex justify-center pb-8 opacity-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vespera-logo.png"
          alt=""
          aria-hidden="true"
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Pearl glow + chromatic + lust animations */}
      <style jsx global>{`
        /* Pearl logo glow */
        .pearl-glow {
          filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.4))
                  drop-shadow(0 0 24px rgba(168, 85, 247, 0.3));
          animation: pearlPulse 4s ease-in-out infinite;
        }
        .pearl-glow-lust {
          filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.7))
                  drop-shadow(0 0 32px rgba(217, 70, 239, 0.5));
          animation: pearlPulseLust 2s ease-in-out infinite;
        }
        @keyframes pearlPulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.4)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.3)); }
          50%      { filter: drop-shadow(0 0 18px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 32px rgba(168, 85, 247, 0.5)); }
        }
        @keyframes pearlPulseLust {
          0%, 100% { filter: drop-shadow(0 0 16px rgba(236, 72, 153, 0.7)) drop-shadow(0 0 32px rgba(217, 70, 239, 0.5)); }
          50%      { filter: drop-shadow(0 0 24px rgba(236, 72, 153, 1.0)) drop-shadow(0 0 48px rgba(217, 70, 239, 0.8)); }
        }

        /* Chromatic aberration text — RGB split */
        .chromatic-text {
          position: relative;
          display: inline-block;
          line-height: 1.1;
        }
        .chromatic-layer {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.85;
          mix-blend-mode: screen;
          pointer-events: none;
          white-space: nowrap;
        }
        .chromatic-r { color: #ff006e; transform: translate(-2px, 0); animation: chromShiftR 4s ease-in-out infinite; }
        .chromatic-g { color: #00ff88; transform: translate(0, 0); animation: chromShiftG 5s ease-in-out infinite; }
        .chromatic-b { color: #00d4ff; transform: translate(2px, 0); animation: chromShiftB 4.5s ease-in-out infinite; }
        .chromatic-actual {
          position: relative;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #a855f7 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .chromatic-lust .chromatic-r { color: #ff1493; }
        .chromatic-lust .chromatic-g { color: #ff6ec7; }
        .chromatic-lust .chromatic-b { color: #c026d3; }
        .chromatic-lust .chromatic-actual {
          background: linear-gradient(135deg, #ff1493 0%, #c026d3 50%, #ff6ec7 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
        @keyframes chromShiftR { 0%,100%{transform:translate(-2px,0);} 50%{transform:translate(-4px,-1px);} }
        @keyframes chromShiftG { 0%,100%{transform:translate(0,0);} 50%{transform:translate(0,1px);} }
        @keyframes chromShiftB { 0%,100%{transform:translate(2px,0);} 50%{transform:translate(4px,1px);} }

        /* Gold text for "Vespera World" header in default mode */
        .gold-text {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        /* Chrome border for "Powered by" pill */
        .chrome-border {
          border: 1px solid transparent;
          background-clip: padding-box;
          position: relative;
        }
        .chrome-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 1px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.5), rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Floating hearts animation */
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}