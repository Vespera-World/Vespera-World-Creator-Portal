"use client"

import { useState, useTransition } from "react"
import { format, isPast, isToday, isTomorrow, addDays } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Filter,
  ListTodo,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientTask } from "@/lib/types/database"

interface TasksClientProps {
  tasks: ClientTask[]
  clientId: string
  isDemo?: boolean
}

export function TasksClient({ tasks, clientId, isDemo }: TasksClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [optimisticTasks, setOptimisticTasks] = useState(tasks)

  const filteredTasks = optimisticTasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const pendingCount = optimisticTasks.filter(t => t.status === 'pending').length
  const inProgressCount = optimisticTasks.filter(t => t.status === 'in_progress').length
  const completedCount = optimisticTasks.filter(t => t.status === 'completed').length

  const handleToggleComplete = async (task: ClientTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    
    // Optimistic update
    setOptimisticTasks(prev => 
      prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("client_tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", task.id)

    if (error) {
      // Revert on error
      setOptimisticTasks(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: task.status } : t)
      )
    }

    startTransition(() => {
      router.refresh()
    })
  }

  const getTaskDueLabel = (dueDate: string | null) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    
    if (isPast(date) && !isToday(date)) {
      return { label: 'Overdue', className: 'text-destructive' }
    }
    if (isToday(date)) {
      return { label: 'Due today', className: 'text-warning' }
    }
    if (isTomorrow(date)) {
      return { label: 'Due tomorrow', className: 'text-gold' }
    }
    if (date <= addDays(new Date(), 7)) {
      return { label: `Due ${format(date, 'EEEE')}`, className: 'text-muted-foreground' }
    }
    return { label: format(date, 'MMM d'), className: 'text-muted-foreground' }
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' }
      case 'medium':
        return { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/30' }
      default:
        return { bg: 'bg-purple/10', text: 'text-purple', border: 'border-purple/30' }
    }
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Tasks</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your assigned tasks and track your progress.
        </p>
      </div>

      {/* Stats & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'all'
                ? "bg-purple/20 text-purple border border-purple/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            All ({optimisticTasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'pending'
                ? "bg-gold/20 text-gold border border-gold/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'in_progress'
                ? "bg-purple/20 text-purple border border-purple/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              filter === 'completed'
                ? "bg-success/20 text-success border border-success/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass-card p-5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="h-16 w-16 text-purple/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You don't have any tasks assigned yet."
                : `No ${filter.replace('_', ' ')} tasks.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const dueInfo = getTaskDueLabel(task.due_date)
              const priorityStyles = getPriorityStyles(task.priority)
              const isCompleted = task.status === 'completed'

              return (
                <div 
                  key={task.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-all",
                    "bg-muted/20 hover:bg-muted/30",
                    isCompleted && "opacity-60"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 shrink-0"
                    disabled={isPending}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-gold transition-colors" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={cn(
                        "font-medium",
                        isCompleted && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        priorityStyles.bg,
                        priorityStyles.text,
                        `border ${priorityStyles.border}`
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {dueInfo && (
                        <span className={cn("flex items-center gap-1", dueInfo.className)}>
                          <Clock className="h-3 w-3" />
                          {dueInfo.label}
                        </span>
                      )}
                      {task.assigned_by && (
                        <span>Assigned by {task.assigned_by}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
