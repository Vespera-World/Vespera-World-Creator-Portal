"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  FolderOpen,
} from "lucide-react"
import { useState, useEffect } from "react"

const navigation = [
  { 
    title: "Dashboard", 
    href: "/admin", 
    icon: LayoutDashboard,
    description: "Combined overview"
  },
  { 
    title: "Creators", 
    href: "/admin/creators", 
    icon: Users,
    description: "Manage creators"
  },
  { 
    title: "Analytics", 
    href: "/admin/analytics", 
    icon: BarChart3,
    description: "Combined analytics"
  },
  { 
    title: "Finances", 
    href: "/admin/finances", 
    icon: Wallet,
    description: "Combined finances"
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FolderOpen,
    description: "All creator content"
  },
  { 
    title: "Settings", 
    href: "/admin/settings", 
    icon: Settings,
    description: "Admin settings"
  },
]

interface AdminSidebarProps {
  adminName?: string
  adminEmail?: string
}

export function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const initials = adminName 
    ? adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD'

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass-card"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 gradient-mesh border-r border-border/30 overflow-hidden transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border/30 px-6 shrink-0">
            <Image
              src="/images/vespera-logo.png"
              alt="Vespera World"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">Vespera</h1>
              <p className="text-[10px] uppercase tracking-widest text-gold">Admin Portal</p>
            </div>
          </div>

          {/* Agency Badge */}
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20">
              <Building2 className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-gold">Agency View</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-vespera">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive(item.href)
                        ? "sidebar-item-active bg-accent/20 text-gold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive(item.href) && "text-gold"
                    )} />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.description && (
                        <span className="text-[10px] text-muted-foreground/70">{item.description}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t border-border/30 p-4 shrink-0">
            <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-purple">
                <span className="text-sm font-semibold text-primary-foreground">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {adminName || 'Admin'}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {adminEmail || 'admin@vesperaworld.com'}
                </p>
              </div>
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
