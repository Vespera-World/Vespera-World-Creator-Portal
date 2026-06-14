"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Client, Transaction } from "@/lib/types/database"

interface FinancesClientProps {
  creators: Client[]
  transactions: (Transaction & { creator_name: string })[]
  isDemo?: boolean
}

export function FinancesClient({ 
  creators,
  transactions,
  isDemo = false,
}: FinancesClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCreator, setSelectedCreator] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchQuery === "" || 
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.creator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCreator = selectedCreator === "all" || tx.client_id === selectedCreator
    const matchesType = selectedType === "all" || tx.type === selectedType

    return matchesSearch && matchesCreator && matchesType
  })

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)
  
  const totalExpenses = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const netRevenue = totalIncome - totalExpenses

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 rounded-lg bg-gold/20 border border-gold/30 text-center">
          <p className="text-sm text-gold-light">
            Demo Mode - Viewing sample financial data.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Combined Finances</span>
        </h1>
        <p className="text-muted-foreground">
          Financial overview across all creators.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold mt-1 text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className={`text-2xl font-bold mt-1 ${netRevenue >= 0 ? 'text-gold' : 'text-destructive'}`}>
                {formatCurrency(netRevenue)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-vespera"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted/30 border border-border/30 text-sm focus:border-purple focus:outline-none"
            >
              <option value="all">All Creators</option>
              {creators.map(creator => (
                <option key={creator.id} value={creator.id}>
                  {creator.display_name || creator.name}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted/30 border border-border/30 text-sm focus:border-purple focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/10">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Creator</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-6 text-sm">
                      {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-gold to-purple text-xs font-semibold text-primary-foreground">
                          {tx.creator_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{tx.creator_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {tx.description || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="pill-purple capitalize">{tx.category || 'Other'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`pill ${tx.status === 'completed' ? 'pill-success' : tx.status === 'pending' ? 'pill-warning' : 'pill-danger'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-right font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
