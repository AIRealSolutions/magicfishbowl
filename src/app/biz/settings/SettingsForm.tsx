'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Upload, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@/lib/utils'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

type DayHours = { open: string; close: string; closed: boolean }
type Hours = Record<string, DayHours>

interface Merchant {
  id: string
  business_name: string
  category: string
  address: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  hours: Hours | null
}

const DEFAULT_HOURS: Hours = Object.fromEntries(
  DAYS.map(({ key }) => [key, { open: '09:00', close: '17:00', closed: key === 'sun' }])
)

export default function SettingsForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    business_name: merchant.business_name,
    category: merchant.category,
    address: merchant.address ?? '',
    logo_url: merchant.logo_url ?? '',
  })

  const [hours, setHours] = useState<Hours>(
    merchant.hours ?? DEFAULT_HOURS
  )

  function updateDay(day: string, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB')
      return
    }
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${merchant.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('merchant-logos')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('merchant-logos')
        .getPublicUrl(path)

      setForm((f) => ({ ...f, logo_url: publicUrl }))
      toast.success('Logo uploaded!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hours }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      toast.success('Settings saved!')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your business info — changes appear on the discovery map.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Business Logo</h2>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl">🏪</span>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-secondary text-sm"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              {form.logo_url && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, logo_url: '' }))}
                  className="ml-2 text-xs text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3 inline" /> Remove
                </button>
              )}
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · Max 2MB</p>
            </div>
          </div>
        </div>

        {/* Business info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Business Information</h2>

          <div>
            <label className="label">Business Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              className="input"
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Category <span className="text-red-400">*</span></label>
            <select
              required
              className="input"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Business Address</label>
            <input
              type="text"
              className="input"
              placeholder="123 Main St, City, State 12345"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to place your pin on the discovery map. We&apos;ll geocode it automatically.
            </p>
          </div>
        </div>

        {/* Hours */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Hours of Operation</h2>
          </div>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const day = hours[key] ?? { open: '09:00', close: '17:00', closed: false }
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!day.closed}
                        onChange={(e) => updateDay(key, 'closed', !e.target.checked)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{label.slice(0, 3)}</span>
                    </label>
                  </div>
                  {day.closed ? (
                    <span className="text-sm text-gray-400 italic">Closed</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) => updateDay(key, 'open', e.target.value)}
                        className="input py-1.5 text-sm w-32"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) => updateDay(key, 'close', e.target.value)}
                        className="input py-1.5 text-sm w-32"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
