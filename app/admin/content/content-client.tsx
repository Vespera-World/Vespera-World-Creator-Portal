"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Image as ImageIcon,
  Video,
  File,
  Download,
  Grid3X3,
  List,
  Search,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  ShoppingBag,
  Package,
  DollarSign,
  Eye,
  Camera,
  Sparkles,
  Share2,
  Instagram,
  Calendar,
  Play,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreatorFile, Client, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

interface AdminContentClientProps {
  files: (CreatorFile & { client?: Client })[]
  marketplaceItems: (MarketplaceItem & { client?: Client })[]
  socialContent: (SocialMediaContent & { client?: Client })[]
  clients: Client[]
  isDemo?: boolean
}

type ViewMode = "grid" | "list"
type TabType = "raw" | "edited" | "marketplace" | "social"

export function AdminContentClient({ 
  files, 
  marketplaceItems, 
  socialContent,
  clients,
  isDemo 
}: AdminContentClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("raw")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCreator, setSelectedCreator] = useState<string>("all")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<(MarketplaceItem & { client?: Client }) | null>(null)
  const [selectedSocialContent, setSelectedSocialContent] = useState<(SocialMediaContent & { client?: Client }) | null>(null)

  // Filter by creator
  const filterByCreator = <T extends { client_id: string | null }>(items: T[]): T[] => {
    if (selectedCreator === "all") return items
    return items.filter(item => item.client_id === selectedCreator)
  }

  // Filter files by storage type
  const rawFiles = files.filter(f => f.storage_type === 'raw')
  const editedFiles = files.filter(f => f.storage_type === 'completed' || f.status === 'completed')

  // Apply media type filter
  const filterByMediaType = (fileList: (CreatorFile & { client?: Client })[]) => {
    if (mediaTypeFilter === 'all') return fileList
    return fileList.filter(f => f.file_type === mediaTypeFilter)
  }

  // Filter by search
  const filterBySearch = <T extends { file_name?: string; title?: string; description?: string | null; client?: Client }>(
    items: T[]
  ): T[] => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      item.file_name?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.client?.display_name?.toLowerCase().includes(query) ||
      item.client?.name?.toLowerCase().includes(query)
    )
  }

  const filteredRawFiles = filterBySearch(filterByCreator(filterByMediaType(rawFiles)))
  const filteredEditedFiles = filterBySearch(filterByCreator(filterByMediaType(editedFiles)))
  const filteredMarketplaceItems = filterBySearch(filterByCreator(marketplaceItems))
  const filteredSocialContent = filterBySearch(filterByCreator(socialContent))

  const getFileIcon = (file: CreatorFile, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "lg" ? "h-8 w-8" : "h-5 w-5"
    switch (file.file_type) {
      case 'image':
        return <ImageIcon className={cn(iconSize, "text-purple")} />
      case 'video':
        return <Video className={cn(iconSize, "text-gold")} />
      default:
        return <File className={cn(iconSize, "text-muted-foreground")} />
    }
  }

  const getStatusBadge = (status: CreatorFile['status']) => {
    switch (status) {
      case 'uploaded':
        return <span className="pill-gold text-xs">Uploaded</span>
      case 'processing':
        return <span className="pill-purple text-xs">Processing</span>
      case 'completed':
        return <span className="pill-success text-xs">Ready</span>
      case 'failed':
        return <span className="pill-danger text-xs">Failed</span>
    }
  }

  const getSocialStatusBadge = (status: SocialMediaContent['status']) => {
    switch (status) {
      case 'draft':
        return <span className="pill-gold">Draft</span>
      case 'scheduled':
        return <span className="pill-purple">Scheduled</span>
      case 'published':
        return <span className="pill-success">Published</span>
      case 'archived':
        return <span className="pill-muted">Archived</span>
    }
  }

  const getPlatformIcon = (platform: SocialMediaContent['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'tiktok':
      case 'youtube':
        return <Play className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
  }

  const getItemTypeIcon = (type: MarketplaceItem['item_type']) => {
    switch (type) {
      case 'bundle':
        return <Package className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'photo_pack':
        return <ImageIcon className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  const handleDownload = async (file: CreatorFile) => {
    if (isDemo) {
      setError("Sign in to download files")
      return
    }

    const supabase = createClient()
    const bucket = file.storage_type === 'completed' ? 'creator-completed' : 'creator-raw'
    const path = file.completed_path || file.file_path

    if (!path) {
      setError("File path not found")
      return
    }

    const { data, error: dlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60)

    if (dlError) {
      setError(`Failed to get download link: ${dlError.message}`)
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  // Stats
  const totalRaw = filterByCreator(rawFiles).length
  const totalEdited = filterByCreator(editedFiles).length
  const totalMarketplace = filterByCreator(marketplaceItems).length
  const totalSocial = filterByCreator(socialContent).length
  const totalRevenue = filterByCreator(marketplaceItems).reduce((acc, item) => acc + (item.sold_count * item.price), 0)

  const tabs = [
    { id: 'raw' as const, label: 'Raw Content', icon: Camera, count: totalRaw },
    { id: 'edited' as const, label: 'Edited Content', icon: Sparkles, count: totalEdited },
    { id: 'marketplace' as const, label: 'Marketplace', icon: ShoppingBag, count: totalMarketplace },
    { id: 'social' as const, label: 'Social Media', icon: Share2, count: totalSocial },
  ]

  // File Grid/List Component
  const FileDisplay = ({ fileList }: { fileList: (CreatorFile & { client?: Client })[] }) => (
    <div className="p-4 space-y-4">
      {/* Media Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <div className="flex gap-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'image', label: 'Photos', icon: ImageIcon },
            { id: 'video', label: 'Videos', icon: Video },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setMediaTypeFilter(filter.id as 'all' | 'image' | 'video')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                mediaTypeFilter === filter.id
                  ? "bg-gold/20 text-gold"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {filter.icon && <filter.icon className="h-3.5 w-3.5" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex rounded-lg border border-border/50 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Files */}
      {fileList.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <File className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No files found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCreator !== 'all' ? 'This creator has no files yet' : 'No content available'}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="group relative rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-gold/30 transition-all"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center">
                {getFileIcon(file, "lg")}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate" title={file.file_name}>
                  {file.file_name}
                </p>
                {file.client && (
                  <p className="text-xs text-purple truncate mb-1">
                    {file.client.display_name || file.client.name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                  {getStatusBadge(file.status)}
                </div>
              </div>
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 rounded-lg bg-gold text-primary-foreground hover:bg-gold/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.client?.display_name || file.client?.name} · {formatFileSize(file.file_size)} · {formatDate(file.updated_at)}
                </p>
              </div>
              {getStatusBadge(file.status)}
              <button
                onClick={() => handleDownload(file)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Marketplace Display
  const MarketplaceDisplay = () => (
    <div className="p-4 space-y-4">
      {filteredMarketplaceItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No marketplace items</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCreator !== 'all' ? 'This creator has no products yet' : 'No products available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarketplaceItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMarketplaceItem(item)}
              className="glass-card-hover cursor-pointer overflow-hidden group"
            >
              <div className="aspect-video bg-gradient-to-br from-purple/20 to-gold/20 flex items-center justify-center relative">
                {getItemTypeIcon(item.item_type)}
                {item.is_featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gold text-xs font-medium text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                  <span className="text-lg font-bold text-gold">{formatPrice(item.price, item.currency)}</span>
                </div>
                {item.client && (
                  <p className="text-xs text-purple mb-2">{item.client.display_name || item.client.name}</p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={item.is_published ? "pill-success" : "pill-gold"}>
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-muted-foreground">{item.sold_count} sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMarketplaceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedMarketplaceItem.title}</h2>
                  {selectedMarketplaceItem.client && (
                    <p className="text-sm text-purple">By {selectedMarketplaceItem.client.display_name || selectedMarketplaceItem.client.name}</p>
                  )}
                  <p className="text-2xl font-bold text-gold mt-1">{formatPrice(selectedMarketplaceItem.price, selectedMarketplaceItem.currency)}</p>
                </div>
                <button onClick={() => setSelectedMarketplaceItem(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-muted-foreground mb-4">{selectedMarketplaceItem.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Sold</p>
                  <p className="text-lg font-semibold text-foreground">{selectedMarketplaceItem.sold_count}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-semibold text-gold">{formatPrice(selectedMarketplaceItem.sold_count * selectedMarketplaceItem.price)}</p>
                </div>
              </div>
              {selectedMarketplaceItem.keywords && selectedMarketplaceItem.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMarketplaceItem.keywords.map((tag, i) => (
                      <span key={i} className="pill-purple">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setSelectedMarketplaceItem(null)} className="btn-outline w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Social Media Display
  const SocialMediaDisplay = () => (
    <div className="p-4 space-y-4">
      {filteredSocialContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No social media content</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCreator !== 'all' ? 'This creator has no social content yet' : 'No social content available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSocialContent.map((content) => (
            <div
              key={content.id}
              onClick={() => setSelectedSocialContent(content)}
              className="glass-card-hover cursor-pointer overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-purple/20 to-gold/20 flex items-center justify-center relative">
                {getPlatformIcon(content.platform)}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/80 text-xs font-medium capitalize">
                  {content.platform}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-medium text-foreground line-clamp-1">{content.title}</h3>
                  {getSocialStatusBadge(content.status)}
                </div>
                {content.client && (
                  <p className="text-xs text-purple mb-2">{content.client.display_name || content.client.name}</p>
                )}
                {content.caption && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{content.caption}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {content.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(content.scheduled_date)}
                    </span>
                  )}
                  <span className="capitalize">{content.content_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSocialContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(selectedSocialContent.platform)}
                  <span className="font-medium capitalize">{selectedSocialContent.platform}</span>
                  {getSocialStatusBadge(selectedSocialContent.status)}
                </div>
                <button onClick={() => setSelectedSocialContent(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{selectedSocialContent.title}</h2>
              {selectedSocialContent.client && (
                <p className="text-sm text-purple mb-3">By {selectedSocialContent.client.display_name || selectedSocialContent.client.name}</p>
              )}
              {selectedSocialContent.caption && (
                <div className="mb-4 p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedSocialContent.caption}</p>
                </div>
              )}
              {selectedSocialContent.hashtags && selectedSocialContent.hashtags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Hashtags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSocialContent.hashtags.map((tag, i) => (
                      <span key={i} className="pill-purple">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Content Type</p>
                  <p className="font-medium text-foreground capitalize">{selectedSocialContent.content_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="font-medium text-foreground">
                    {selectedSocialContent.scheduled_date ? new Date(selectedSocialContent.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedSocialContent(null)} className="btn-outline w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content</h1>
          <p className="text-sm text-muted-foreground">View all creator content across the platform</p>
        </div>
        {isDemo && <span className="pill-gold">Demo Mode</span>}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10"><Camera className="h-5 w-5 text-purple" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalRaw}</p>
              <p className="text-xs text-muted-foreground">Raw Files</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10"><Sparkles className="h-5 w-5 text-gold" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEdited}</p>
              <p className="text-xs text-muted-foreground">Edited Files</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><ShoppingBag className="h-5 w-5 text-green-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalMarketplace}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Share2 className="h-5 w-5 text-blue-500" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSocial}</p>
              <p className="text-xs text-muted-foreground">Social Posts</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10"><DollarSign className="h-5 w-5 text-purple" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card">
        {/* Tabs */}
        <div className="border-b border-border/30 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-vespera pl-10 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              className="input-vespera py-2 text-sm min-w-[180px]"
            >
              <option value="all">All Creators</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.display_name || client.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "raw" && <FileDisplay fileList={filteredRawFiles} />}
        {activeTab === "edited" && <FileDisplay fileList={filteredEditedFiles} />}
        {activeTab === "marketplace" && <MarketplaceDisplay />}
        {activeTab === "social" && <SocialMediaDisplay />}
      </div>
    </div>
  )
}
