"use client"

import { useState } from "react"
import { format } from "date-fns"
import Link from "next/link"
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreatorFormDoc } from "@/lib/types/database"

interface FormsClientProps {
  formsDocs: CreatorFormDoc[]
  clientId: string
  isDemo?: boolean
}

const formTemplates = [
  {
    key: 'independent_contractor',
    title: 'Independent Contractor Agreement',
    description: 'Standard contractor agreement for content creators',
    category: 'Contract',
  },
  {
    key: 'platform_agreement',
    title: 'Platform Agreement',
    description: 'Terms and conditions for platform usage',
    category: 'Agreement',
  },
  {
    key: 'w9_form',
    title: 'W-9 Tax Form',
    description: 'IRS form for tax identification',
    category: 'Tax',
  },
  {
    key: 'nda',
    title: 'Non-Disclosure Agreement',
    description: 'Confidentiality agreement',
    category: 'Legal',
  },
]

export function FormsClient({ formsDocs, clientId, isDemo }: FormsClientProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'draft' | 'approved' | 'rejected'>('all')

  const filteredDocs = formsDocs.filter(doc => {
    if (filter === 'all') return true
    return doc.status === filter
  })

  const stats = {
    pending: formsDocs.filter(d => d.status === 'pending').length,
    draft: formsDocs.filter(d => d.status === 'draft').length,
    approved: formsDocs.filter(d => d.status === 'approved').length,
    rejected: formsDocs.filter(d => d.status === 'rejected').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gold" />
      default:
        return <AlertCircle className="h-4 w-4 text-purple" />
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'pill-success'
      case 'rejected':
        return 'pill-danger'
      case 'pending':
        return 'pill-warning'
      default:
        return 'pill-purple'
    }
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">Forms & Documents</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your contracts, agreements, and required documents.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10">
              <FileText className="h-4 w-4 text-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Draft</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <Clock className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              filter === f
                ? f === 'approved' 
                  ? "bg-success/20 text-success border border-success/30"
                  : f === 'rejected'
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : f === 'pending'
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "bg-purple/20 text-purple border border-purple/30"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {f} ({f === 'all' ? formsDocs.length : stats[f as keyof typeof stats]})
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Your Documents</h2>
        
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gold/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You don't have any documents yet."
                : `No ${filter} documents.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="p-3 rounded-lg bg-gold/10 shrink-0">
                  <FileText className="h-5 w-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{doc.title}</h3>
                    <span className={getStatusStyles(doc.status)}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{doc.category || 'Document'}</span>
                    {doc.signed_at && (
                      <>
                        <span>•</span>
                        <span>Signed {format(new Date(doc.signed_at), 'MMM d, yyyy')}</span>
                      </>
                    )}
                    {doc.approved_at && (
                      <>
                        <span>•</span>
                        <span>Approved {format(new Date(doc.approved_at), 'MMM d, yyyy')}</span>
                      </>
                    )}
                  </div>
                  {doc.review_comment && doc.status === 'rejected' && (
                    <p className="text-sm text-destructive mt-2">
                      Comment: {doc.review_comment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.status === 'draft' && (
                    <Link
                      href={`/portal/forms/${doc.form_key}?edit=${doc.id}`}
                      className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
                      title="Continue editing"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                  {doc.pdf_storage_path && (
                    <button 
                      className="p-2 rounded-lg bg-purple/10 text-purple hover:bg-purple/20 transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Forms */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold mb-4">Available Forms</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Start a new form or document from our templates.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formTemplates.map((template) => {
            const existingDoc = formsDocs.find(d => d.form_key === template.key)
            const hasSubmitted = existingDoc && existingDoc.status !== 'rejected'
            
            return (
              <Link
                key={template.key}
                href={hasSubmitted ? '#' : `/portal/forms/${template.key}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  hasSubmitted 
                    ? "bg-muted/10 cursor-not-allowed opacity-60"
                    : "bg-muted/20 hover:bg-muted/30"
                )}
              >
                <div className="p-3 rounded-lg bg-purple/10 shrink-0">
                  <FileText className="h-5 w-5 text-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{template.title}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                {hasSubmitted ? (
                  <span className={getStatusStyles(existingDoc!.status)}>
                    {existingDoc!.status}
                  </span>
                ) : (
                  <Plus className="h-5 w-5 text-purple" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
