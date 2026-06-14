"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  ListTodo,
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react"
import type { Client, ClientTask, Transaction, CreatorFormDoc } from "@/lib/types/database"

interface DashboardClientProps {
  client: Client | null
  tasks: ClientTask[]
  transactions: Transaction[]
  formsDocs: CreatorFormDoc[]
  stats: {
    pendingTasks: number
    pendingForms: number
    monthlyRevenue: number
    revenueChange: number
  }
  isDemo?: boolean
}

export function DashboardClient({ 
  client, 
  tasks, 
  transactions, 
  formsDocs,
  stats,
  isDemo = false,
}: DashboardClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'pill-danger'
      case 'medium': return 'pill-warning'
      default: return 'pill-purple'
    }
  }

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'pill-success'
      case 'rejected': return 'pill-danger'
      case 'pending': return 'pill-warning'
      default: return 'pill-purple'
    }
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 rounded-lg bg-purple/20 border border-purple/30 text-center">
          <p className="text-sm text-purple-light">
            Demo Mode - Viewing sample data. Sign in to see your real information.
          </p>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          Welcome back, <span className="gradient-gold">{client?.display_name || client?.name || 'Creator'}</span>
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {stats.revenueChange >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+{stats.revenueChange}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{stats.revenueChange}%</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingTasks}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <ListTodo className="h-5 w-5 text-purple" />
            </div>
          </div>
          <Link 
            href="/portal/tasks"
            className="flex items-center gap-1 mt-3 text-sm text-purple hover:text-purple-light transition-colors"
          >
            View all tasks
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Pending Forms */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Forms</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingForms}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <FileText className="h-5 w-5 text-gold" />
            </div>
          </div>
          <Link 
            href="/portal/forms"
            className="flex items-center gap-1 mt-3 text-sm text-gold hover:text-gold-light transition-colors"
          >
            Review forms
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Subscribers */}
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subscribers</p>
              <p className="text-2xl font-bold mt-1">{client?.subscribers?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <TrendingUp className="h-5 w-5 text-purple" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Across all platforms
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
            <Link 
              href="/portal/tasks"
              className="text-sm text-purple hover:text-purple-light transition-colors"
            >
              View all
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending tasks</p>
              <p className="text-sm text-muted-foreground/70">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <span className={getTaskPriorityColor(task.priority)}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Link 
              href="/portal/finances"
              className="text-sm text-gold hover:text-gold-light transition-colors"
            >
              View all
            </Link>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gold/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground/70">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <div className={`p-2 rounded-lg ${tx.type === 'revenue' || tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'revenue' || tx.type === 'income' ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tx.description || tx.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.transaction_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className={`font-semibold ${tx.type === 'revenue' || tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'revenue' || tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forms & Documents Status */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Forms & Documents</h2>
            <Link 
              href="/portal/forms"
              className="text-sm text-purple hover:text-purple-light transition-colors"
            >
              Manage all
            </Link>
          </div>
          
          {formsDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-purple/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No documents yet</p>
              <p className="text-sm text-muted-foreground/70">
                Forms and documents you need to complete will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formsDocs.slice(0, 6).map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple/10">
                    <FileText className="h-4 w-4 text-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.category || 'Document'}</p>
                  </div>
                  <span className={getFormStatusColor(doc.status)}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
