"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  ListTodo,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import type { Client, ClientTask, Transaction, CreatorFormDoc } from "@/lib/types/database"

interface CreatorDetailClientProps {
  creator: Client
  tasks: ClientTask[]
  transactions: Transaction[]
  forms: CreatorFormDoc[]
  isDemo?: boolean
}

export function CreatorDetailClient({ 
  creator,
  tasks,
  transactions,
  forms,
  isDemo = false,
}: CreatorDetailClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'pill-danger'
      case 'medium': return 'pill-warning'
      default: return 'pill-purple'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'pill-success'
      case 'in_progress': return 'pill-warning'
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

  const pendingTasks = tasks.filter(t => t.status !== 'completed').length
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

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

      {/* Back Link & Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/creators"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all creators
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold to-purple text-2xl font-bold text-primary-foreground shrink-0">
            {(creator.display_name || creator.name).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold gradient-gold">
                {creator.display_name || creator.name}
              </h1>
              <span className={`pill ${creator.status === 'active' ? 'pill-success' : 'pill-danger'}`}>
                {creator.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{creator.bio || 'No bio available'}</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{creator.email}</span>
          </div>
          {creator.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{creator.phone}</span>
            </div>
          )}
          {creator.platform && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{creator.platform}</span>
            </div>
          )}
          {creator.join_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {format(new Date(creator.join_date), 'MMMM yyyy')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1 text-gold">{formatCurrency(creator.monthly_revenue || 0)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {(creator.revenue_change || 0) >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-success">+{creator.revenue_change?.toFixed(1) || 0}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{creator.revenue_change?.toFixed(1) || 0}%</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subscribers</p>
              <p className="text-2xl font-bold mt-1">{(creator.subscribers || 0).toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <Users className="h-5 w-5 text-purple" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">On {creator.platform || 'all platforms'}</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold mt-1">{pendingTasks}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <ListTodo className="h-5 w-5 text-purple" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{tasks.length} total tasks</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Earnings</p>
              <p className="text-2xl font-bold mt-1 text-success">{formatCurrency(totalIncome - totalExpenses)}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">From recent transactions</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-purple" />
            Tasks
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-success/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No tasks assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
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
                  <span className={getTaskStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={getTaskPriorityColor(task.priority)}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gold" />
            Recent Transactions
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gold/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
                >
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'income' ? (
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
                  <p className={`font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forms & Documents */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple" />
            Forms & Documents
          </h2>
          
          {forms.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-purple/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No documents yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {forms.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20"
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
