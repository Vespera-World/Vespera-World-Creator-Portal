"use client"

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  PieChart,
} from "lucide-react"
import type { Client } from "@/lib/types/database"

interface AnalyticsClientProps {
  creators: Client[]
  monthlyData: { month: string; revenue: number; subscribers: number }[]
  isDemo?: boolean
}

export function AnalyticsClient({ 
  creators, 
  monthlyData,
  isDemo = false,
}: AnalyticsClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const totalRevenue = creators.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0)
  const totalSubscribers = creators.reduce((sum, c) => sum + (c.subscribers || 0), 0)
  const avgRevenue = creators.length > 0 ? totalRevenue / creators.length : 0

  // Revenue by platform
  const platformData = creators.reduce((acc, creator) => {
    const platform = creator.platform || 'Other'
    if (!acc[platform]) {
      acc[platform] = { revenue: 0, count: 0, subscribers: 0 }
    }
    acc[platform].revenue += creator.monthly_revenue || 0
    acc[platform].count += 1
    acc[platform].subscribers += creator.subscribers || 0
    return acc
  }, {} as Record<string, { revenue: number; count: number; subscribers: number }>)

  const platforms = Object.entries(platformData).map(([name, data]) => ({
    name,
    ...data,
    percentage: totalRevenue > 0 ? ((data.revenue / totalRevenue) * 100).toFixed(1) : 0
  }))

  // Max revenue for chart scaling
  const maxMonthlyRevenue = Math.max(...monthlyData.map(d => d.revenue))

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 rounded-lg bg-gold/20 border border-gold/30 text-center">
          <p className="text-sm text-gold-light">
            Demo Mode - Viewing sample analytics data.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Combined Analytics</span>
        </h1>
        <p className="text-muted-foreground">
          Performance metrics across all creators.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
              <p className="text-2xl font-bold mt-1">{totalSubscribers.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <Users className="h-5 w-5 text-purple" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Revenue/Creator</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(avgRevenue)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <BarChart3 className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Platforms</p>
              <p className="text-2xl font-bold mt-1">{platforms.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <PieChart className="h-5 w-5 text-purple" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center gap-3">
                <span className="w-10 text-sm text-muted-foreground">{data.month}</span>
                <div className="flex-1 h-8 bg-muted/20 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-gold-dark rounded-lg flex items-center justify-end px-2 transition-all duration-500"
                    style={{ width: `${(data.revenue / maxMonthlyRevenue) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-primary-foreground">
                      {formatCurrency(data.revenue)}
                    </span>
                  </div>
                </div>
                {index > 0 && (
                  <div className="w-16 flex items-center gap-1">
                    {data.revenue >= monthlyData[index - 1].revenue ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={`text-xs ${data.revenue >= monthlyData[index - 1].revenue ? 'text-success' : 'text-destructive'}`}>
                      {(((data.revenue - monthlyData[index - 1].revenue) / monthlyData[index - 1].revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Platform */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold mb-4">Revenue by Platform</h2>
          <div className="space-y-4">
            {platforms.map((platform, index) => (
              <div key={platform.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        background: index === 0 ? 'var(--gold)' : 
                                   index === 1 ? 'var(--purple)' : 
                                   'var(--muted-foreground)' 
                      }}
                    />
                    <span className="font-medium">{platform.name}</span>
                    <span className="text-xs text-muted-foreground">({platform.count} creators)</span>
                  </div>
                  <span className="font-semibold text-gold">{formatCurrency(platform.revenue)}</span>
                </div>
                <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${platform.percentage}%`,
                      background: index === 0 ? 'linear-gradient(90deg, var(--gold), var(--gold-dark))' : 
                                 index === 1 ? 'linear-gradient(90deg, var(--purple), var(--purple-dark))' : 
                                 'var(--muted-foreground)'
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {platform.percentage}% of total &middot; {platform.subscribers.toLocaleString()} subscribers
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Performance */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Creator Performance Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Creator</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Platform</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Subscribers</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Change</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Share</th>
                </tr>
              </thead>
              <tbody>
                {creators.map((creator) => {
                  const share = totalRevenue > 0 ? ((creator.monthly_revenue || 0) / totalRevenue * 100) : 0
                  return (
                    <tr key={creator.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-purple text-xs font-semibold text-primary-foreground">
                            {(creator.display_name || creator.name)?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{creator.display_name || creator.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="pill-purple">{creator.platform || 'Multi'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gold">
                        {formatCurrency(creator.monthly_revenue || 0)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(creator.subscribers || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(creator.revenue_change || 0) >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <span className={`text-sm ${(creator.revenue_change || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {(creator.revenue_change || 0) >= 0 ? '+' : ''}{creator.revenue_change?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
