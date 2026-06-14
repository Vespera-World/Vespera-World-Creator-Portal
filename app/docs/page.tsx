'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Database,
  Palette,
  Code,
  Server,
  Shield,
  Users,
  FileText,
  Layers,
  Globe,
  Zap,
  Key,
  Box
} from 'lucide-react'

type SectionId = 'overview' | 'stack' | 'database' | 'auth' | 'features' | 'design' | 'env' | 'api'

export default function DocsPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['overview']))

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const toggleSection = (section: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="absolute top-3 right-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      title="Copy to clipboard"
    >
      {copiedText === id ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  )

  const SectionHeader = ({ 
    id, 
    icon: Icon, 
    title 
  }: { 
    id: SectionId
    icon: React.ElementType
    title: string 
  }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center gap-3 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-left"
    >
      <div className="p-2 rounded-lg bg-purple/10">
        <Icon className="h-5 w-5 text-purple" />
      </div>
      <span className="flex-1 font-semibold text-lg">{title}</span>
      {expandedSections.has(id) ? (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Image
            src="/images/vespera-logo.png"
            alt="Vespera World"
            width={40}
            height={40}
          />
          <div>
            <h1 className="text-xl font-bold gradient-gold">Vespera World</h1>
            <p className="text-sm text-muted-foreground">Technical Documentation</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quick Copy Section */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold" />
            Quick Copy - Full Documentation
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Click the button below to copy the entire documentation in Markdown format.
          </p>
          <button
            onClick={() => copyToClipboard(FULL_MARKDOWN_DOCS, 'full-docs')}
            className="btn-gold flex items-center gap-2"
          >
            {copiedText === 'full-docs' ? (
              <>
                <Check className="h-4 w-4" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Full Documentation
              </>
            )}
          </button>
        </div>

        {/* Table of Contents */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Box },
              { id: 'stack', label: 'Tech Stack', icon: Layers },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'auth', label: 'Authentication', icon: Shield },
              { id: 'features', label: 'Features', icon: Zap },
              { id: 'design', label: 'Design System', icon: Palette },
              { id: 'env', label: 'Environment', icon: Key },
              { id: 'api', label: 'API Routes', icon: Globe },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setExpandedSections(prev => new Set([...prev, id as SectionId]))
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-sm"
              >
                <Icon className="h-4 w-4 text-purple" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-4">
          {/* Overview */}
          <section id="overview">
            <SectionHeader id="overview" icon={Box} title="Project Overview" />
            {expandedSections.has('overview') && (
              <div className="glass-card p-6 mt-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-gold mb-2">Vespera World Creator Portal</h3>
                  <p className="text-muted-foreground">
                    A comprehensive creator management platform built for content creators and their management teams. 
                    The platform features two main interfaces: an Admin Dashboard for management and a Creator Portal for individual creators.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">Admin Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Full management interface for overseeing all creators, finances, content, and analytics.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/20">
                    <h4 className="font-medium mb-2">Creator Portal</h4>
                    <p className="text-sm text-muted-foreground">
                      Individual creator view for managing their own content, tasks, finances, and profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Tech Stack */}
          <section id="stack">
            <SectionHeader id="stack" icon={Layers} title="Technology Stack" />
            {expandedSections.has('stack') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={STACK_SECTION} id="stack-section" />
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gold mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Frontend
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>Next.js 16</strong> - React Framework with App Router
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>React 19</strong> - UI Library
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>TypeScript 5.7</strong> - Type Safety
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>Tailwind CSS 4</strong> - Styling
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>Radix UI</strong> - Headless Components
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple" />
                        <strong>Lucide React</strong> - Icons
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gold mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Backend & Infrastructure
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <strong>Supabase</strong> - Database & Auth
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <strong>PostgreSQL</strong> - Database Engine
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <strong>Vercel</strong> - Hosting & Deployment
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <strong>Row Level Security</strong> - Data Protection
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium mb-2">Key Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {['@supabase/ssr', '@supabase/supabase-js', 'recharts', 'date-fns', 'zod', 'react-hook-form', 'sonner', 'next-themes'].map(dep => (
                      <span key={dep} className="px-2 py-1 rounded bg-muted text-xs font-mono">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Database */}
          <section id="database">
            <SectionHeader id="database" icon={Database} title="Database Schema" />
            {expandedSections.has('database') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={DATABASE_SECTION} id="database-section" />
                <p className="text-sm text-muted-foreground mb-4">
                  All tables have Row Level Security (RLS) enabled. The database is hosted on Supabase PostgreSQL.
                </p>
                
                <div className="space-y-6">
                  {/* Core Tables */}
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Core Tables</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40">
                            <th className="text-left py-2 px-3">Table</th>
                            <th className="text-left py-2 px-3">Description</th>
                            <th className="text-right py-2 px-3">Rows</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">clients</td>
                            <td className="py-2 px-3 text-muted-foreground">Creator profiles with CRM data, financial info, identity</td>
                            <td className="py-2 px-3 text-right">6</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">client_social_links</td>
                            <td className="py-2 px-3 text-muted-foreground">Social media accounts with follower counts</td>
                            <td className="py-2 px-3 text-right">7</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">client_analytics</td>
                            <td className="py-2 px-3 text-muted-foreground">Revenue, profit, engagement metrics</td>
                            <td className="py-2 px-3 text-right">1</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">client_tasks</td>
                            <td className="py-2 px-3 text-muted-foreground">Tasks assigned to creators</td>
                            <td className="py-2 px-3 text-right">2</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">transactions</td>
                            <td className="py-2 px-3 text-muted-foreground">Income and expense records</td>
                            <td className="py-2 px-3 text-right">4</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">creator_portal_users</td>
                            <td className="py-2 px-3 text-muted-foreground">Auth users with role (admin/creator)</td>
                            <td className="py-2 px-3 text-right">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Content & Links */}
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Content & Links</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40">
                            <th className="text-left py-2 px-3">Table</th>
                            <th className="text-left py-2 px-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">link_hub_links</td>
                            <td className="py-2 px-3 text-muted-foreground">Bio page links (like Linktree)</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">creator_files</td>
                            <td className="py-2 px-3 text-muted-foreground">Uploaded content files</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">content_items</td>
                            <td className="py-2 px-3 text-muted-foreground">Content management</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">creator_forms_docs</td>
                            <td className="py-2 px-3 text-muted-foreground">Forms and documents</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Team & Admin */}
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Team & Administration</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40">
                            <th className="text-left py-2 px-3">Table</th>
                            <th className="text-left py-2 px-3">Description</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">team_members</td>
                            <td className="py-2 px-3 text-muted-foreground">Internal team profiles</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">vendors</td>
                            <td className="py-2 px-3 text-muted-foreground">External service providers</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">projects</td>
                            <td className="py-2 px-3 text-muted-foreground">Project management</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">announcements</td>
                            <td className="py-2 px-3 text-muted-foreground">Internal announcements</td>
                          </tr>
                          <tr className="border-b border-border/20">
                            <td className="py-2 px-3 text-purple">support_tickets</td>
                            <td className="py-2 px-3 text-muted-foreground">Support request tracking</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Authentication */}
          <section id="auth">
            <SectionHeader id="auth" icon={Shield} title="Authentication" />
            {expandedSections.has('auth') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={AUTH_SECTION} id="auth-section" />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gold mb-2">Authentication Flow</h4>
                    <p className="text-sm text-muted-foreground">
                      Uses Supabase Auth with email/password authentication. Users are assigned roles via the 
                      <code className="mx-1 px-1 rounded bg-muted text-purple">creator_portal_users</code> table.
                    </p>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple" />
                        Admin Role
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- Access to /admin routes</li>
                        <li>- Manage all creators</li>
                        <li>- View all finances</li>
                        <li>- Full analytics access</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gold" />
                        Creator Role
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- Access to /portal routes</li>
                        <li>- View own profile</li>
                        <li>- Manage own content</li>
                        <li>- View own finances</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple/10 border border-purple/20">
                    <h5 className="font-medium mb-2">Demo Mode</h5>
                    <p className="text-sm text-muted-foreground">
                      The app supports unauthenticated access with demo data. Users can explore the interface 
                      without signing in by clicking &quot;Skip Login (Demo Mode)&quot; on the login page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Features */}
          <section id="features">
            <SectionHeader id="features" icon={Zap} title="Features" />
            {expandedSections.has('features') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={FEATURES_SECTION} id="features-section" />
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Admin Dashboard</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Dashboard</strong> - Overview of all creators, revenue, and tasks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Creators</strong> - Full CRM with filtering by status (active, prospect, cold_lead, inactive)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Finances</strong> - Income/expense tracking with charts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Analytics</strong> - Platform-wide metrics and trends</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Content</strong> - Content management system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple mt-2" />
                        <span><strong>Settings</strong> - Platform configuration</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Creator Portal</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Dashboard</strong> - Personal overview and quick actions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Tasks</strong> - View and complete assigned tasks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Content</strong> - Upload and manage content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Links</strong> - Bio page link management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Finances</strong> - Personal earnings and payouts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Messages</strong> - Communication with management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Forms</strong> - Required documents and forms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                        <span><strong>Profile</strong> - Personal profile management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Design System */}
          <section id="design">
            <SectionHeader id="design" icon={Palette} title="Design System" />
            {expandedSections.has('design') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={DESIGN_SECTION} id="design-section" />
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gold mb-3">Color Palette</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-gold text-primary-foreground text-center">
                        <span className="text-xs font-mono">Gold</span>
                      </div>
                      <div className="p-3 rounded-lg bg-purple text-secondary-foreground text-center">
                        <span className="text-xs font-mono">Purple</span>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border text-center">
                        <span className="text-xs font-mono">Background</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <span className="text-xs font-mono">Muted</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gold mb-3">Typography</h4>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-muted/20">
                        <span className="font-sans">Space Grotesk - Primary Font (font-sans)</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20">
                        <span className="font-mono">Geist Mono - Monospace (font-mono)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gold mb-3">Utility Classes</h4>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.glass-card</span>
                        <span className="text-muted-foreground"> - Glassmorphism card</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.gradient-gold</span>
                        <span className="text-muted-foreground"> - Gold gradient text</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.gradient-purple</span>
                        <span className="text-muted-foreground"> - Purple gradient text</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.btn-gold</span>
                        <span className="text-muted-foreground"> - Gold button</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.btn-purple</span>
                        <span className="text-muted-foreground"> - Purple button</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 font-mono">
                        <span className="text-purple">.pill-*</span>
                        <span className="text-muted-foreground"> - Status badges</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Environment Variables */}
          <section id="env">
            <SectionHeader id="env" icon={Key} title="Environment Variables" />
            {expandedSections.has('env') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={ENV_SECTION} id="env-section" />
                <p className="text-sm text-muted-foreground mb-4">
                  Required environment variables for the application. These are automatically set when using the Supabase integration on Vercel.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left py-2 px-3">Variable</th>
                        <th className="text-left py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      <tr className="border-b border-border/20">
                        <td className="py-2 px-3 text-purple">NEXT_PUBLIC_SUPABASE_URL</td>
                        <td className="py-2 px-3 text-muted-foreground">Supabase project URL</td>
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 px-3 text-purple">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                        <td className="py-2 px-3 text-muted-foreground">Supabase anonymous key (public)</td>
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 px-3 text-purple">SUPABASE_SERVICE_ROLE_KEY</td>
                        <td className="py-2 px-3 text-muted-foreground">Supabase service role key (server-side only)</td>
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 px-3 text-purple">SUPABASE_JWT_SECRET</td>
                        <td className="py-2 px-3 text-muted-foreground">JWT secret for token verification</td>
                      </tr>
                      <tr className="border-b border-border/20">
                        <td className="py-2 px-3 text-purple">POSTGRES_URL</td>
                        <td className="py-2 px-3 text-muted-foreground">PostgreSQL connection string</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* API Routes */}
          <section id="api">
            <SectionHeader id="api" icon={Globe} title="Route Structure" />
            {expandedSections.has('api') && (
              <div className="glass-card p-6 mt-2 relative">
                <CopyButton text={API_SECTION} id="api-section" />
                <div className="space-y-4 font-mono text-sm">
                  <div>
                    <h4 className="font-sans font-semibold text-gold mb-2">Public Routes</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div>/                    <span className="text-purple">Landing page</span></div>
                      <div>/auth/login          <span className="text-purple">Login page</span></div>
                      <div>/auth/callback        <span className="text-purple">OAuth callback</span></div>
                      <div>/docs                 <span className="text-purple">Documentation</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-gold mb-2">Admin Routes (/admin)</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div>/admin                <span className="text-purple">Dashboard</span></div>
                      <div>/admin/creators       <span className="text-purple">Creator list</span></div>
                      <div>/admin/creators/[id]  <span className="text-purple">Creator detail</span></div>
                      <div>/admin/finances       <span className="text-purple">Financial overview</span></div>
                      <div>/admin/analytics      <span className="text-purple">Analytics</span></div>
                      <div>/admin/content        <span className="text-purple">Content management</span></div>
                      <div>/admin/settings       <span className="text-purple">Settings</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-gold mb-2">Creator Portal Routes (/portal)</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <div>/portal               <span className="text-purple">Dashboard</span></div>
                      <div>/portal/tasks         <span className="text-purple">Tasks</span></div>
                      <div>/portal/content       <span className="text-purple">Content</span></div>
                      <div>/portal/links         <span className="text-purple">Bio links</span></div>
                      <div>/portal/finances      <span className="text-purple">Finances</span></div>
                      <div>/portal/messages      <span className="text-purple">Messages</span></div>
                      <div>/portal/forms         <span className="text-purple">Forms</span></div>
                      <div>/portal/profile       <span className="text-purple">Profile</span></div>
                      <div>/portal/settings      <span className="text-purple">Settings</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Vespera World Creator Portal - Technical Documentation</p>
          <p className="mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}

// Full markdown documentation for copy/paste
const FULL_MARKDOWN_DOCS = `# Vespera World Creator Portal

## Technical Documentation

---

## Overview

Vespera World Creator Portal is a comprehensive creator management platform built for content creators and their management teams. The platform features two main interfaces:

- **Admin Dashboard**: Full management interface for overseeing all creators, finances, content, and analytics
- **Creator Portal**: Individual creator view for managing their own content, tasks, finances, and profile

---

## Technology Stack

### Frontend
- **Next.js 16** - React Framework with App Router
- **React 19** - UI Library
- **TypeScript 5.7** - Type Safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Headless Components
- **Lucide React** - Icons

### Backend & Infrastructure
- **Supabase** - Database & Authentication
- **PostgreSQL** - Database Engine
- **Vercel** - Hosting & Deployment
- **Row Level Security (RLS)** - Data Protection

### Key Dependencies
\`\`\`json
{
  "@supabase/ssr": "^0.10.3",
  "@supabase/supabase-js": "^2.106.1",
  "recharts": "2.15.0",
  "date-fns": "4.1.0",
  "zod": "^3.24.1",
  "react-hook-form": "^7.54.1",
  "sonner": "^1.7.1",
  "next-themes": "^0.4.6"
}
\`\`\`

---

## Database Schema

All tables have Row Level Security (RLS) enabled.

### Core Tables

| Table | Description |
|-------|-------------|
| \`clients\` | Creator profiles with CRM data, financial info, identity verification |
| \`client_social_links\` | Social media accounts with follower counts |
| \`client_analytics\` | Revenue, profit, engagement metrics per creator |
| \`client_tasks\` | Tasks assigned to creators |
| \`transactions\` | Income and expense records |
| \`creator_portal_users\` | Auth users linked to clients with role (admin/creator) |

### Content & Links

| Table | Description |
|-------|-------------|
| \`link_hub_links\` | Bio page links (like Linktree) |
| \`creator_files\` | Uploaded content files |
| \`content_items\` | Content management |
| \`creator_forms_docs\` | Forms and documents |

### Team & Administration

| Table | Description |
|-------|-------------|
| \`team_members\` | Internal team profiles |
| \`vendors\` | External service providers |
| \`projects\` | Project management |
| \`announcements\` | Internal announcements |
| \`support_tickets\` | Support request tracking |

### Key TypeScript Interfaces

\`\`\`typescript
interface Client {
  id: string
  name: string
  display_name: string | null
  email: string
  phone: string | null
  platform: string | null
  status: string
  crm_status: 'active' | 'prospect' | 'cold_lead' | 'inactive' | 'example' | null
  monthly_revenue: number | null
  subscribers: number | null
  // ... additional fields for financial, identity, contact info
}

interface ClientSocialLink {
  id: string
  client_id: string
  platform: string
  platform_url: string
  Follower_Count: number | null
  Explicit_Content: boolean | null
}

interface ClientAnalytics {
  id: string
  client_id: string
  revenue: number
  profit: number
  expenses: number
  subscribers: number
  engagement_rate: number
}
\`\`\`

---

## Authentication

### Authentication Flow
Uses Supabase Auth with email/password authentication. Users are assigned roles via the \`creator_portal_users\` table.

### Roles

**Admin Role**
- Access to /admin routes
- Manage all creators
- View all finances
- Full analytics access

**Creator Role**
- Access to /portal routes
- View own profile
- Manage own content
- View own finances

### Demo Mode
The app supports unauthenticated access with demo data. Users can explore the interface without signing in.

---

## Features

### Admin Dashboard
- **Dashboard** - Overview of all creators, revenue, and tasks
- **Creators** - Full CRM with filtering by status (active, prospect, cold_lead, inactive)
- **Finances** - Income/expense tracking with charts
- **Analytics** - Platform-wide metrics and trends
- **Content** - Content management system
- **Settings** - Platform configuration

### Creator Portal
- **Dashboard** - Personal overview and quick actions
- **Tasks** - View and complete assigned tasks
- **Content** - Upload and manage content
- **Links** - Bio page link management
- **Finances** - Personal earnings and payouts
- **Messages** - Communication with management
- **Forms** - Required documents and forms
- **Profile** - Personal profile management

---

## Design System

### Color Palette
- **Gold** - Primary accent (\`oklch(0.75 0.15 85)\`)
- **Purple** - Secondary accent (\`oklch(0.55 0.2 300)\`)
- **Background** - Dark base (\`oklch(0.08 0.01 270)\`)
- **Muted** - Subtle surfaces (\`oklch(0.15 0.02 270)\`)

### Typography
- **Primary Font**: Space Grotesk (font-sans)
- **Monospace**: Geist Mono (font-mono)

### Utility Classes
\`\`\`css
.glass-card      /* Glassmorphism card with backdrop blur */
.gradient-gold   /* Gold gradient text */
.gradient-purple /* Purple gradient text */
.btn-gold        /* Gold gradient button */
.btn-purple      /* Purple gradient button */
.pill-gold       /* Gold status badge */
.pill-purple     /* Purple status badge */
.pill-success    /* Green status badge */
.pill-warning    /* Yellow status badge */
.pill-danger     /* Red status badge */
.input-vespera   /* Styled input field */
\`\`\`

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Supabase project URL |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Supabase anonymous key (public) |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Supabase service role key (server-side) |
| \`SUPABASE_JWT_SECRET\` | JWT secret for token verification |
| \`POSTGRES_URL\` | PostgreSQL connection string |

---

## Route Structure

### Public Routes
\`\`\`
/                    Landing page
/auth/login          Login page
/auth/callback       OAuth callback
/docs                Documentation
\`\`\`

### Admin Routes (/admin)
\`\`\`
/admin               Dashboard
/admin/creators      Creator list
/admin/creators/[id] Creator detail
/admin/finances      Financial overview
/admin/analytics     Analytics
/admin/content       Content management
/admin/settings      Settings
\`\`\`

### Creator Portal Routes (/portal)
\`\`\`
/portal              Dashboard
/portal/tasks        Tasks
/portal/content      Content
/portal/links        Bio links
/portal/finances     Finances
/portal/messages     Messages
/portal/forms        Forms
/portal/profile      Profile
/portal/settings     Settings
\`\`\`

---

## Repository

- **Organization**: Torchline-Group
- **Repository**: v0-creator-portal-development
- **Branch**: data-harmony

---

*Last updated: ${new Date().toLocaleDateString()}*
`

// Section-specific markdown for individual copy
const STACK_SECTION = `## Technology Stack

### Frontend
- **Next.js 16** - React Framework with App Router
- **React 19** - UI Library
- **TypeScript 5.7** - Type Safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Headless Components
- **Lucide React** - Icons

### Backend & Infrastructure
- **Supabase** - Database & Authentication
- **PostgreSQL** - Database Engine
- **Vercel** - Hosting & Deployment
- **Row Level Security (RLS)** - Data Protection

### Key Dependencies
@supabase/ssr, @supabase/supabase-js, recharts, date-fns, zod, react-hook-form, sonner, next-themes`

const DATABASE_SECTION = `## Database Schema

All tables have Row Level Security (RLS) enabled.

### Core Tables
| Table | Description |
|-------|-------------|
| clients | Creator profiles with CRM data, financial info, identity |
| client_social_links | Social media accounts with follower counts |
| client_analytics | Revenue, profit, engagement metrics |
| client_tasks | Tasks assigned to creators |
| transactions | Income and expense records |
| creator_portal_users | Auth users with role (admin/creator) |

### Content & Links
| Table | Description |
|-------|-------------|
| link_hub_links | Bio page links |
| creator_files | Uploaded content files |
| content_items | Content management |
| creator_forms_docs | Forms and documents |

### Team & Administration
| Table | Description |
|-------|-------------|
| team_members | Internal team profiles |
| vendors | External service providers |
| projects | Project management |
| announcements | Internal announcements |
| support_tickets | Support request tracking |`

const AUTH_SECTION = `## Authentication

Uses Supabase Auth with email/password authentication.
Users are assigned roles via the creator_portal_users table.

### Admin Role
- Access to /admin routes
- Manage all creators
- View all finances
- Full analytics access

### Creator Role
- Access to /portal routes
- View own profile
- Manage own content
- View own finances

### Demo Mode
Supports unauthenticated access with demo data for exploration.`

const FEATURES_SECTION = `## Features

### Admin Dashboard
- Dashboard - Overview of all creators, revenue, and tasks
- Creators - Full CRM with status filtering
- Finances - Income/expense tracking with charts
- Analytics - Platform-wide metrics
- Content - Content management system
- Settings - Platform configuration

### Creator Portal
- Dashboard - Personal overview
- Tasks - Assigned tasks
- Content - Content management
- Links - Bio page links
- Finances - Personal earnings
- Messages - Team communication
- Forms - Documents and forms
- Profile - Personal settings`

const DESIGN_SECTION = `## Design System

### Color Palette
- Gold - Primary accent (oklch(0.75 0.15 85))
- Purple - Secondary accent (oklch(0.55 0.2 300))
- Background - Dark base (oklch(0.08 0.01 270))

### Typography
- Primary: Space Grotesk
- Monospace: Geist Mono

### Utility Classes
- .glass-card - Glassmorphism card
- .gradient-gold - Gold gradient text
- .gradient-purple - Purple gradient text
- .btn-gold / .btn-purple - Gradient buttons
- .pill-* - Status badges (gold, purple, success, warning, danger)`

const ENV_SECTION = `## Environment Variables

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (server-side) |
| SUPABASE_JWT_SECRET | JWT secret |
| POSTGRES_URL | PostgreSQL connection string |`

const API_SECTION = `## Route Structure

### Public Routes
/                    Landing page
/auth/login          Login page
/auth/callback       OAuth callback
/docs                Documentation

### Admin Routes (/admin)
/admin               Dashboard
/admin/creators      Creator list
/admin/creators/[id] Creator detail
/admin/finances      Financial overview
/admin/analytics     Analytics
/admin/content       Content management
/admin/settings      Settings

### Creator Portal Routes (/portal)
/portal              Dashboard
/portal/tasks        Tasks
/portal/content      Content
/portal/links        Bio links
/portal/finances     Finances
/portal/messages     Messages
/portal/forms        Forms
/portal/profile      Profile
/portal/settings     Settings`
