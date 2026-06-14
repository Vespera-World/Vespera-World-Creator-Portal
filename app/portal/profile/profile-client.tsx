"use client"

import { format } from "date-fns"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  Users,
  TrendingUp,
  ExternalLink,
} from "lucide-react"
import type { Client } from "@/lib/types/database"

interface ProfileClientProps {
  client: Client | null
  userEmail: string
  isDemo?: boolean
}

export function ProfileClient({ client, userEmail, isDemo }: ProfileClientProps) {
  const initials = client?.display_name 
    ? client.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : client?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-bold">
          <span className="gradient-gold">My Profile</span>
        </h1>
        <p className="text-muted-foreground">
          View and manage your creator profile information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {client?.avatar ? (
              <img 
                src={client.avatar}
                alt={client.display_name || client.name || 'Profile'}
                className="w-24 h-24 rounded-full object-cover border-4 border-gold/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-purple flex items-center justify-center border-4 border-gold/30">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {client?.display_name || client?.name || 'Creator'}
            </h2>
            {client?.bio && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {client.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {client?.platform && (
                <span className="pill-purple flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {client.platform}
                </span>
              )}
              {client?.status && (
                <span className="pill-gold">{client.status}</span>
              )}
              {client?.vespera_slug && (
                <a 
                  href={`https://vespera.link/${client.vespera_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill-success flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  vespera.link/{client.vespera_slug}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(client?.monthly_revenue || 0)}</p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <TrendingUp className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Subscribers</p>
              <p className="text-2xl font-bold mt-1">{client?.subscribers?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple/10">
              <Users className="h-5 w-5 text-purple" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="text-2xl font-bold mt-1">
                {client?.join_date ? format(new Date(client.join_date), 'MMM yyyy') : 'N/A'}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-gold/10">
              <Calendar className="h-5 w-5 text-gold" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <div className="p-2 rounded-lg bg-gold/10">
              <Mail className="h-4 w-4 text-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{client?.email || userEmail}</p>
            </div>
          </div>
          {client?.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <div className="p-2 rounded-lg bg-purple/10">
                <Phone className="h-4 w-4 text-purple" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
          )}
          {(client?.city || client?.state || client?.country) && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <div className="p-2 rounded-lg bg-gold/10">
                <MapPin className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">
                  {[client.city, client.state, client.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="glass-card p-5">
        <p className="text-sm text-muted-foreground text-center">
          To update your profile information, please contact your management team.
        </p>
      </div>
    </div>
  )
}
