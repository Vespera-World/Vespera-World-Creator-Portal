/**
 * Creator KYC / Onboarding Form
 *
 * Multi-step wizard to collect:
 * 1. Government ID (type, number, expiry)
 * 2. Address (line 1, line 2, city, state, zip, country)
 * 3. Tax info (RFC for Mexico, SSN last 4 for US)
 * 4. Emergency contact
 * 5. Government name (legal name on ID)
 * 6. Review & submit
 *
 * All fields save directly to the creators table.
 * Also logs the submission to creator_onboarding_submissions for audit.
 *
 * URL: /portal/onboarding
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  FileText,
  User,
  MapPin,
  AlertTriangle,
  Phone,
  Building2,
  Sparkles,
} from 'lucide-react'
import type { Client } from '@/lib/types/database'

interface OnboardingClientProps {
  client: Client | null
  isDemo?: boolean
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'id', title: 'Government ID', icon: FileText },
  { id: 'address', title: 'Address', icon: MapPin },
  { id: 'tax', title: 'Tax Info', icon: Building2 },
  { id: 'emergency', title: 'Emergency Contact', icon: Phone },
  { id: 'review', title: 'Review', icon: Shield },
] as const

type StepId = (typeof STEPS)[number]['id']

export function OnboardingClient({ client, isDemo }: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState<StepId>('welcome')
  const [saving, setSaving] = useState(false)

  // Form state — initialized from client prop
  const [form, setForm] = useState({
    // Government ID
    id_type: client?.id_type || '',
    id_number: client?.id_number || '',
    id_expiry: client?.id_expiry ? new Date(client.id_expiry).toISOString().split('T')[0] : '',
    ssn_last4: client?.ssn_last4 || '',
    Government_First_Name: client?.Government_First_Name || '',
    Government_Last_Name: client?.Government_Last_Name || '',
    // Address
    address_line1: client?.address_line1 || '',
    address_line2: client?.address_line2 || '',
    city: client?.city || '',
    state: client?.state || '',
    zip_code: client?.zip_code || '',
    country: client?.country || 'MEX',
    // Tax
    RFC: client?.RFC || '',
    // Emergency contact
    emergency_contact_name: client?.emergency_contact_name || '',
    emergency_contact_phone: client?.emergency_contact_phone || '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const isLastStep = step === 'review'

  // Step-level validation
  function validateStep(s: StepId): string | null {
    switch (s) {
      case 'id':
        if (!form.id_type) return 'Select an ID type'
        if (!form.id_number) return 'ID number is required'
        if (form.id_type !== 'passport' && form.id_number.length < 6)
          return 'ID number looks too short'
        if (!form.id_expiry) return 'ID expiry is required'
        const expiry = new Date(form.id_expiry)
        if (expiry < new Date()) return 'ID expiry must be in the future'
        if (!form.Government_First_Name || !form.Government_Last_Name)
          return 'Government name (first + last) is required'
        return null
      case 'address':
        if (!form.address_line1) return 'Street address is required'
        if (!form.city) return 'City is required'
        if (!form.state) return 'State / Province is required'
        if (!form.zip_code) return 'Postal code is required'
        if (!form.country) return 'Country is required'
        return null
      case 'tax':
        // Either SSN (US) or RFC (Mexico) — country-dependent
        if (form.country === 'US' && !form.ssn_last4)
          return 'SSN last 4 is required for US creators'
        if (form.country === 'MEX' && !form.RFC)
          return 'RFC is required for Mexico creators'
        return null
      case 'emergency':
        if (!form.emergency_contact_name) return 'Emergency contact name is required'
        if (!form.emergency_contact_phone) return 'Emergency contact phone is required'
        return null
      default:
        return null
    }
  }

  function next() {
    const err = validateStep(step)
    if (err) {
      toast.error(err)
      return
    }
    const idx = STEPS.findIndex((s) => s.id === step)
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id)
    }
  }

  function prev() {
    const idx = STEPS.findIndex((s) => s.id === step)
    if (idx > 0) {
      setStep(STEPS[idx - 1].id)
    }
  }

  async function submit() {
    if (!client?.id) {
      toast.error('Could not identify your creator profile')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/creator/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      toast.success('Onboarding submitted — your manager will review shortly')
      // Redirect to portal dashboard
      setTimeout(() => router.push('/portal'), 1500)
    } catch (e: any) {
      console.error('Submit onboarding error:', e)
      toast.error(e?.message || 'Failed to submit onboarding')
    } finally {
      setSaving(false)
    }
  }

  // === RENDER ===

  if (step === 'welcome') {
    return (
      <div className="space-y-6 pt-12 lg:pt-0">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <Sparkles className="h-12 w-12 mx-auto text-gold mb-2" />
            <CardTitle className="text-3xl gradient-gold">Welcome to Vespera World</CardTitle>
            <CardDescription className="text-base">
              Let's get your account verified so we can start sending you payouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <FileText className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Government-issued ID</p>
                  <p className="text-sm text-muted-foreground">
                    Required for 2257 compliance and identity verification.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <MapPin className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Mailing address</p>
                  <p className="text-sm text-muted-foreground">
                    Where we send tax forms and important documents.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <Building2 className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Tax identification</p>
                  <p className="text-sm text-muted-foreground">
                    SSN last 4 (US) or RFC (Mexico) for tax reporting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                <Phone className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Emergency contact</p>
                  <p className="text-sm text-muted-foreground">
                    Someone we can reach in case of emergency.
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Your data is secure</AlertTitle>
              <AlertDescription className="text-sm">
                All information is encrypted at rest and only visible to your manager
                and the compliance team.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => router.push('/portal')}>
                Skip for now
              </Button>
              <Button onClick={next} className="btn-gold">
                Get Started
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="space-y-6 pt-12 lg:pt-0">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-gold">Review Your Information</CardTitle>
            <CardDescription>
              Make sure everything looks right before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReviewSection title="Government ID" icon={FileText}>
              <ReviewRow label="ID Type" value={form.id_type} />
              <ReviewRow label="ID Number" value={form.id_number} />
              <ReviewRow label="Expiry" value={form.id_expiry} />
              <ReviewRow label="Name on ID" value={`${form.Government_First_Name} ${form.Government_Last_Name}`} />
              {form.ssn_last4 && <ReviewRow label="SSN last 4" value={form.ssn_last4} />}
            </ReviewSection>

            <ReviewSection title="Address" icon={MapPin}>
              <ReviewRow label="Street" value={`${form.address_line1}${form.address_line2 ? ', ' + form.address_line2 : ''}`} />
              <ReviewRow label="City, State, Zip" value={`${form.city}, ${form.state} ${form.zip_code}`} />
              <ReviewRow label="Country" value={form.country} />
            </ReviewSection>

            <ReviewSection title="Tax" icon={Building2}>
              {form.RFC && <ReviewRow label="RFC" value={form.RFC} />}
              {form.ssn_last4 && <ReviewRow label="SSN last 4" value={form.ssn_last4} />}
            </ReviewSection>

            <ReviewSection title="Emergency Contact" icon={Phone}>
              <ReviewRow label="Name" value={form.emergency_contact_name} />
              <ReviewRow label="Phone" value={form.emergency_contact_phone} />
            </ReviewSection>

            {isDemo && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Demo mode</AlertTitle>
                <AlertDescription>
                  You're viewing this in demo mode. Sign in to submit your information.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prev}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={submit} disabled={saving || isDemo} className="btn-gold">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Form steps (id, address, tax, emergency)
  const stepInfo = STEPS.find((s) => s.id === step)!
  const StepIcon = stepInfo.icon

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Step progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>Step {STEPS.findIndex((s) => s.id === step) + 1} of {STEPS.length}</span>
        <span>{stepInfo.title}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold to-purple transition-all duration-300"
          style={{ width: `${((STEPS.findIndex((s) => s.id === step) + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StepIcon className="h-5 w-5 text-gold" />
            {stepInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'id' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id-type">ID Type *</Label>
                <select
                  id="id-type"
                  value={form.id_type}
                  onChange={(e) => update('id_type', e.target.value)}
                  className="input-vespera w-full"
                >
                  <option value="">Select ID type...</option>
                  <option value="passport">Passport</option>
                  <option value="ine">INE / IFE (Mexico)</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="state_id">State ID</option>
                  <option value="mil_id">Military ID</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="id-number">ID Number *</Label>
                <Input
                  id="id-number"
                  value={form.id_number}
                  onChange={(e) => update('id_number', e.target.value)}
                  className="input-vespera font-mono"
                  placeholder="ABC123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id-expiry">Expiry Date *</Label>
                <Input
                  id="id-expiry"
                  type="date"
                  value={form.id_expiry}
                  onChange={(e) => update('id_expiry', e.target.value)}
                  className="input-vespera"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gov-first">First Name (as on ID) *</Label>
                  <Input
                    id="gov-first"
                    value={form.Government_First_Name}
                    onChange={(e) => update('Government_First_Name', e.target.value)}
                    className="input-vespera"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gov-last">Last Name (as on ID) *</Label>
                  <Input
                    id="gov-last"
                    value={form.Government_Last_Name}
                    onChange={(e) => update('Government_Last_Name', e.target.value)}
                    className="input-vespera"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'address' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addr1">Street Address *</Label>
                <Input
                  id="addr1"
                  value={form.address_line1}
                  onChange={(e) => update('address_line1', e.target.value)}
                  className="input-vespera"
                  placeholder="123 Main St, Apt 4B"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr2">Address Line 2</Label>
                <Input
                  id="addr2"
                  value={form.address_line2}
                  onChange={(e) => update('address_line2', e.target.value)}
                  className="input-vespera"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="input-vespera"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="input-vespera"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal Code *</Label>
                  <Input
                    id="zip"
                    value={form.zip_code}
                    onChange={(e) => update('zip_code', e.target.value)}
                    className="input-vespera"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                    className="input-vespera w-full"
                  >
                    <option value="MEX">Mexico</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="COL">Colombia</option>
                    <option value="ARG">Argentina</option>
                    <option value="ESP">Spain</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 'tax' && (
            <div className="space-y-4">
              {form.country === 'US' ? (
                <div className="space-y-2">
                  <Label htmlFor="ssn">SSN (last 4 digits) *</Label>
                  <Input
                    id="ssn"
                    value={form.ssn_last4}
                    onChange={(e) => update('ssn_last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="input-vespera font-mono"
                    placeholder="1234"
                    maxLength={4}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">
                    We only store the last 4 digits for tax reporting purposes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC (Mexican tax ID) *</Label>
                  <Input
                    id="rfc"
                    value={form.RFC}
                    onChange={(e) => update('RFC', e.target.value.toUpperCase())}
                    className="input-vespera font-mono"
                    placeholder="ABCD800815XYZ"
                    maxLength={13}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for Mexican tax reporting (SAT).
                  </p>
                </div>
              )}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Privacy</AlertTitle>
                <AlertDescription className="text-sm">
                  Tax IDs are encrypted and only visible to the compliance team.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'emergency' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ec-name">Contact Name *</Label>
                <Input
                  id="ec-name"
                  value={form.emergency_contact_name}
                  onChange={(e) => update('emergency_contact_name', e.target.value)}
                  className="input-vespera"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-phone">Contact Phone *</Label>
                <Input
                  id="ec-phone"
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={(e) => update('emergency_contact_phone', e.target.value)}
                  className="input-vespera"
                  placeholder="+52 555 123 4567"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code. We only contact in case of emergency.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prev}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={next} className="btn-gold">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: any
  children: React.ReactNode
}) {
  return (
    <div className="border border-border/30 rounded-lg p-4">
      <h4 className="font-semibold flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-gold" />
        {title}
      </h4>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}