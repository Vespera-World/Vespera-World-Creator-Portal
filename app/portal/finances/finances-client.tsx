"use client"

import { useState, useMemo } from "react"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PiggyBank,
  Filter,
  Calendar,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import type { Transaction, Client } from "@/lib/types/database"

interface FinancesClientProps {
  transactions: Transaction[]
  client: Client | null
  isDemo?: boolean
}

export function FinancesClient({ transactions, client, isDemo }: FinancesClientProps) {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('6m')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Calculate date range
  const monthsToShow = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
  const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1))
  const endDate = endOfMonth(new Date())

  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = parseISO(tx.transaction_date)
      const inRange = isWithinInterval(txDate, { start: startDate, end: endDate })
      const matchesFilter = filter === 'all' || tx.type === filter
      return inRange && matchesFilter
    })
  }, [transactions, startDate, endDate, filter])

  // Calculate stats
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const totalExpenses = filteredTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const netProfit = totalIncome - totalExpenses
    
    return { totalIncome, totalExpenses, netProfit }
  }, [filteredTransactions])

  // Prepare chart data
  const chartData = useMemo(() => {
    const months: { [key: string]: { income: number; expenses: number } } = {}
    
    // Initialize months
    for (let i = 0; i < monthsToShow; i++) {
      const date = subMonths(new Date(), monthsToShow - 1 - i)
      const key = format(date, 'MMM yyyy')
      months[key] = { income: 0, expenses: 0 }
    }
    
    // Aggregate transactions
    filteredTransactions.forEach(tx => {
      const key = format(parseISO(tx.transaction_date), 'MMM yyyy')
      if (months[key]) {
        if (tx.type === 'income') {
          months[key].income += Number(tx.amount)
        } else {
          months[key].expenses += Number(tx.amount)
        }
      }
    })
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }))
  }, [filteredTransactions, monthsToShow])

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Finances</span>
        </h1>
        <p className="text-muted-foreground">
          Track your earnings, expenses, and financial performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(client?.monthly_revenue || 0)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {(client?.revenue_change || 0) >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+{client?.revenue_change || 0}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{client?.revenue_change || 0}%</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold mt-1 text-success">{formatCurrency(stats.totalIncome)}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Last {monthsToShow} months
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(stats.totalExpenses)}</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Last {monthsToShow} months
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                stats.netProfit >= 0 ? "text-gold" : "text-destructive"
              )}>
                {formatCurrency(stats.netProfit)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <PiggyBank className="h-5 w-5 text-gold" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Last {monthsToShow} months
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold">Revenue Overview</h2>
          <div className="flex gap-2">
            {(['3m', '6m', '12m'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  timeRange === range
                    ? "bg-purple/20 text-purple border border-purple/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '12 Months'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.22 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 270)" />
              <XAxis 
                dataKey="month" 
                stroke="oklch(0.65 0.02 270)"
                fontSize={12}
              />
              <YAxis 
                stroke="oklch(0.65 0.02 270)"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0.02 270)',
                  border: '1px solid oklch(0.25 0.03 270)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="oklch(0.65 0.2 145)"
                fill="url(#incomeGradient)"
                strokeWidth={2}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="oklch(0.55 0.22 25)"
                fill="url(#expenseGradient)"
                strokeWidth={2}
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                  filter === f
                    ? f === 'income' 
                      ? "bg-success/20 text-success border border-success/30"
                      : f === 'expense'
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-purple/20 text-purple border border-purple/30"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-gold/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              Transactions will appear here once recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.slice(0, 20).map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                )}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tx.description || tx.category}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{format(parseISO(tx.transaction_date), 'MMM d, yyyy')}</span>
                    {tx.category && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{tx.category}</span>
                      </>
                    )}
                    {tx.payment_method && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{tx.payment_method}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className={cn(
                  "font-semibold shrink-0",
                  tx.type === 'income' ? 'text-success' : 'text-destructive'
                )}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
