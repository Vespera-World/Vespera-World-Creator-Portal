"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Upload,
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
  Plus,
  ShoppingBag,
  Package,
  Tag,
  DollarSign,
  Eye,
  Edit2,
  Trash2,
  Camera,
  Sparkles,
  Share2,
  Instagram,
  Calendar,
  Hash,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreatorFile, Client, MarketplaceItem, SocialMediaContent } from "@/lib/types/database"

interface ContentClientProps {
  files: CreatorFile[]
  marketplaceItems: MarketplaceItem[]
  socialContent: SocialMediaContent[]
  client: Client | null
  isDemo?: boolean
  userId?: string
  clientId?: string
}

type ViewMode = "grid" | "list"
type TabType = "raw" | "edited" | "marketplace" | "social"

export function ContentClient({ 
  files, 
  marketplaceItems, 
  socialContent,
  client, 
  isDemo, 
  userId, 
  clientId 
}: ContentClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("raw")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [selectedMarketplaceItem, setSelectedMarketplaceItem] = useState<MarketplaceItem | null>(null)
  const [selectedSocialContent, setSelectedSocialContent] = useState<SocialMediaContent | null>(null)
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all')

  // Filter files by storage type and media type
  const rawFiles = files.filter(f => f.storage_type === 'raw')
  const editedFiles = files.filter(f => f.storage_type === 'completed' || f.status === 'completed')

  // Apply media type filter
  const filterByMediaType = (fileList: CreatorFile[]) => {
    if (mediaTypeFilter === 'all') return fileList
    return fileList.filter(f => f.file_type === mediaTypeFilter)
  }

  // Filter by search
  const filterBySearch = <T extends { file_name?: string; title?: string; description?: string | null }>(
    items: T[]
  ): T[] => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      item.file_name?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  }

  const filteredRawFiles = filterBySearch(filterByMediaType(rawFiles))
  const filteredEditedFiles = filterBySearch(filterByMediaType(editedFiles))
  const filteredMarketplaceItems = filterBySearch(marketplaceItems)
  const filteredSocialContent = filterBySearch(socialContent)

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
        return (
          <span className="pill-gold flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Uploaded
          </span>
        )
      case 'processing':
        return (
          <span className="pill-purple flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </span>
        )
      case 'completed':
        return (
          <span className="pill-success flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ready
          </span>
        )
      case 'failed':
        return (
          <span className="pill-danger flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        )
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
        return <Play className="h-4 w-4" />
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getFileType = (mimeType: string): CreatorFile['file_type'] => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'other'
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (isDemo) {
      setError("Sign in to upload files")
      return
    }

    const droppedFiles = Array.from(e.dataTransfer.files)
    await uploadFiles(droppedFiles)
  }, [isDemo])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      setError("Sign in to upload files")
      return
    }
    
    const selectedFiles = Array.from(e.target.files || [])
    await uploadFiles(selectedFiles)
  }

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!userId || !clientId) {
      setError("User not authenticated")
      return
    }

    setIsUploading(true)
    setError(null)
    const supabase = createClient()

    for (const file of filesToUpload) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const filePath = `${clientId}/${Date.now()}-${file.name}`
        
        const { error: uploadError } = await supabase.storage
          .from('creator-raw')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(`Failed to upload ${file.name}: ${uploadError.message}`)
          continue
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 50 }))

        const { error: dbError } = await supabase
          .from('creator_files')
          .insert({
            client_id: clientId,
            uploaded_by: userId,
            storage_type: 'raw',
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            file_type: getFileType(file.type),
            status: 'uploaded',
          })

        if (dbError) {
          console.error('DB error:', dbError)
          setError(`Failed to save ${file.name}: ${dbError.message}`)
          continue
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

      } catch (err) {
        console.error('Upload error:', err)
        setError(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)
    setUploadProgress({})
    router.refresh()
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

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60)

    if (error) {
      setError(`Failed to get download link: ${error.message}`)
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  // Stats for header
  const totalRaw = rawFiles.length
  const totalEdited = editedFiles.length
  const totalMarketplace = marketplaceItems.length
  const totalSocial = socialContent.length

  const tabs = [
    { id: 'raw' as const, label: 'Raw Content', icon: Camera, count: totalRaw },
    { id: 'edited' as const, label: 'Edited Content', icon: Sparkles, count: totalEdited },
    { id: 'marketplace' as const, label: 'Marketplace', icon: ShoppingBag, count: totalMarketplace },
    { id: 'social' as const, label: 'Social Media', icon: Share2, count: totalSocial },
  ]

  // File Grid/List Component
  const FileDisplay = ({ fileList, showUpload = false }: { fileList: CreatorFile[], showUpload?: boolean }) => (
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

      {/* Upload Area - only show on Raw tab */}
      {showUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 text-center transition-all",
            isDragging
              ? "border-gold bg-gold/5"
              : "border-border/50 hover:border-purple/50 hover:bg-purple/5"
          )}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple" />
              <p className="text-sm text-muted-foreground">Uploading files...</p>
              {Object.entries(uploadProgress).map(([name, progress]) => (
                <div key={name} className="max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="truncate">{name}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold to-purple transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">
                Drop files here to upload
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Photos and videos for raw content
              </p>
              <label className="btn-gold cursor-pointer inline-flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                Select Files
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
              </label>
            </>
          )}
        </div>
      )}

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
          <h3 className="text-lg font-medium text-foreground mb-1">No files yet</h3>
          <p className="text-sm text-muted-foreground">
            {showUpload ? "Upload your first file to get started" : "No edited content available"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {fileList.map((file) => (
            <div
              key={file.id}
              className="group relative rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-gold/30 transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-muted/30 flex items-center justify-center">
                {getFileIcon(file, "lg")}
              </div>
              
              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-foreground truncate" title={file.file_name}>
                  {file.file_name}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                  {getStatusBadge(file.status)}
                </div>
              </div>

              {/* Hover Actions */}
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
                <p className="text-sm font-medium text-foreground truncate">
                  {file.file_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file_size)} · {formatDate(file.updated_at)}
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
      {/* Add New Button */}
      <div className="flex justify-end">
        <button className="btn-gold flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {filteredMarketplaceItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No marketplace items</h3>
          <p className="text-sm text-muted-foreground">Create your first product to sell</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarketplaceItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMarketplaceItem(item)}
              className="glass-card-hover cursor-pointer overflow-hidden group"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gradient-to-br from-purple/20 to-gold/20 flex items-center justify-center relative">
                {getItemTypeIcon(item.item_type)}
                {item.is_featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gold text-xs font-medium text-primary-foreground">
                    Featured
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                  <span className="text-lg font-bold text-gold">{formatPrice(item.price, item.currency)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={item.is_published ? "pill-success" : "pill-gold"}>
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-muted-foreground">{item.sold_count} sold</span>
                </div>
                
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.keywords.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                    {item.keywords.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{item.keywords.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Marketplace Item Modal */}
      {selectedMarketplaceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedMarketplaceItem.title}</h2>
                  <p className="text-2xl font-bold text-gold mt-1">
                    {formatPrice(selectedMarketplaceItem.price, selectedMarketplaceItem.currency)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMarketplaceItem(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
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
                  <p className="text-lg font-semibold text-gold">
                    {formatPrice(selectedMarketplaceItem.sold_count * selectedMarketplaceItem.price)}
                  </p>
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

              <div className="flex gap-2">
                <button className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button className="btn-outline flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Social Media Display
  const SocialMediaDisplay = () => (
    <div className="p-4 space-y-4">
      {/* Add New Button */}
      <div className="flex justify-end">
        <button className="btn-gold flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </button>
      </div>

      {filteredSocialContent.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <Share2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">No social media content</h3>
          <p className="text-sm text-muted-foreground">Plan and schedule your social posts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSocialContent.map((content) => (
            <div
              key={content.id}
              onClick={() => setSelectedSocialContent(content)}
              className="glass-card-hover cursor-pointer overflow-hidden"
            >
              {/* Cover */}
              <div className="aspect-video bg-gradient-to-br from-purple/20 to-gold/20 flex items-center justify-center relative">
                {getPlatformIcon(content.platform)}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/80 text-xs font-medium capitalize">
                  {content.platform}
                </span>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-foreground line-clamp-1">{content.title}</h3>
                  {getSocialStatusBadge(content.status)}
                </div>
                
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
                
                {content.hashtags && content.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {content.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                    {content.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{content.hashtags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Content Modal */}
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
                <button
                  onClick={() => setSelectedSocialContent(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">{selectedSocialContent.title}</h2>

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
                    {selectedSocialContent.scheduled_date 
                      ? new Date(selectedSocialContent.scheduled_date).toLocaleDateString()
                      : 'Not scheduled'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button className="btn-outline flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </button>
              </div>
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
          <p className="text-sm text-muted-foreground">
            Manage your raw, edited, marketplace, and social media content
          </p>
        </div>
        {isDemo && (
          <span className="pill-gold">Demo Mode</span>
        )}
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

      {/* Tabs */}
      <div className="glass-card">
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
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-vespera pl-10 py-2 text-sm"
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "raw" && <FileDisplay fileList={filteredRawFiles} showUpload />}
        {activeTab === "edited" && <FileDisplay fileList={filteredEditedFiles} />}
        {activeTab === "marketplace" && <MarketplaceDisplay />}
        {activeTab === "social" && <SocialMediaDisplay />}
      </div>
    </div>
  )
}
