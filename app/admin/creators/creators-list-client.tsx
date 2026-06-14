"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  ListTodo,
  ExternalLink,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Client } from "@/lib/types/database"

interface CreatorsListClientProps {
  creators: (Client & { pending_tasks: number })[]
  isDemo?: boolean
}

export function CreatorsListClient({ 
  creators,
  isDemo = false,
}: CreatorsListClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get unique platforms
  const platforms = [...new Set(creators.map(c => c.platform).filter(Boolean))]

  // Filter creators
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = searchQuery === "" || 
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || creator.status === statusFilter
    const matchesPlatform = platformFilter === "all" || creator.platform === platformFilter

    return matchesSearch && matchesStatus && matchesPlatform
  })

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 rounded-lg bg-gold/20 border border-gold/30 text-center">
          <p className="text-sm text-gold-light">
            Demo Mode - Viewing sample creator data.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            <span className="gradient-gold">Creators</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and view all creators in your agency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="pill-gold">
            <Users className="h-3 w-3 mr-1" />
            {creators.filter(c => c.status === 'active').length} Active
          </div>
          <div className="pill-purple">
            {creators.length} Total
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-vespera"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted/30 border border-border/30 text-sm focus:border-purple focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted/30 border border-border/30 text-sm focus:border-purple focus:outline-none"
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform!}>{platform}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {filteredCreators.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No creators found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreators.map((creator) => (
            <Link 
              key={creator.id}
              href={`/admin/creators/${creator.id}`}
              className="glass-card-hover p-5 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold to-purple text-lg font-bold text-primary-foreground shrink-0">
                  {(creator.display_name || creator.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{creator.display_name || creator.name}</h3>
                    <span className={`pill text-[10px] ${creator.status === 'active' ? 'pill-success' : 'pill-danger'}`}>
                      {creator.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{creator.email}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  <p className="text-lg font-bold text-gold">{formatCurrency(creator.monthly_revenue || 0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {(creator.revenue_change || 0) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs ${(creator.revenue_change || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {(creator.revenue_change || 0) >= 0 ? '+' : ''}{creator.revenue_change?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                  <p className="text-lg font-bold">{(creator.subscribers || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{creator.platform || 'Multi-platform'}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {creator.pending_tasks > 0 ? (
                      <span className="text-warning">{creator.pending_tasks} pending tasks</span>
                    ) : (
                      <span className="text-success">All tasks complete</span>
                    )}
                  </span>
                </div>
                {creator.join_date && (
                  <span className="text-xs text-muted-foreground">
                    Joined {format(new Date(creator.join_date), 'MMM yyyy')}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
