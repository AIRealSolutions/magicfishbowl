'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, UserCog, Loader2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface StaffMember {
  id: string
  full_name: string
  is_active: boolean
  created_at: string
}

interface Props {
  merchantId: string
  subscriptionTier: string
  initialStaff: StaffMember[]
}

const SEAT_LIMITS: Record<string, number> = { starter: 2, pro: 10, agency: Infinity }

export default function StaffManager({ merchantId, subscriptionTier, initialStaff }: Props) {
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', pin: '' })

  const maxSeats = SEAT_LIMITS[subscriptionTier] ?? 2
  const activeCount = staff.filter((s) => s.is_active).length

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (form.pin.length < 4 || form.pin.length > 6) {
      toast.error('PIN must be 4-6 digits')
      return
    }
    setLoading('add')
    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: merchantId, full_name: form.full_name, pin: form.pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add staff')
      setStaff((prev) => [data.staff, ...prev])
      setForm({ full_name: '', pin: '' })
      setShowForm(false)
      toast.success('Staff member added!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add staff')
    } finally {
      setLoading(null)
    }
  }

  async function toggleActive(staffId: string, currentActive: boolean) {
    setLoading(staffId)
    try {
      const res = await fetch('/api/staff/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId, is_active: !currentActive }),
      })
      if (!res.ok) throw new Error('Failed')
      setStaff((prev) => prev.map((s) => s.id === staffId ? { ...s, is_active: !currentActive } : s))
      toast.success(currentActive ? 'Staff deactivated' : 'Staff reactivated')
    } catch {
      toast.error('Failed to update staff')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} / {maxSeats === Infinity ? '∞' : maxSeats} seats used
          </p>
        </div>
        {(maxSeats === Infinity || staff.length < maxSeats) && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Staff Member</h2>
          <div>
            <label className="label">Full Name</label>
            <input type="text" required className="input" placeholder="Alex Johnson"
              value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">PIN (4-6 digits)</label>
            <input
              type="password"
              inputMode="numeric"
              required
              minLength={4}
              maxLength={6}
              pattern="[0-9]{4,6}"
              className="input tracking-widest text-xl"
              placeholder="••••"
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              Share this PIN with the staff member. They&apos;ll enter it to confirm each redemption.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading === 'add'} className="btn-primary">
              {loading === 'add' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Staff Member
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Staff list */}
      {staff.length === 0 ? (
        <div className="card text-center py-14">
          <UserCog className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h2 className="font-semibold text-gray-700 mb-2">No staff yet</h2>
          <p className="text-sm text-gray-400 mb-4">Add staff members so they can confirm redemptions with a PIN.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex">
            <Plus className="h-4 w-4" />
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <div key={s.id} className="card flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700">
                {s.full_name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{s.full_name}</div>
                <div className="text-xs text-gray-400">
                  Added {new Date(s.created_at).toLocaleDateString()}
                  {' · '}{s.is_active ? '✓ Active' : '✗ Inactive'}
                </div>
              </div>
              <button
                onClick={() => toggleActive(s.id, s.is_active)}
                disabled={loading === s.id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  s.is_active ? 'bg-brand-600' : 'bg-gray-200'
                }`}
                title={s.is_active ? 'Deactivate' : 'Activate'}
              >
                {loading === s.id ? (
                  <Loader2 className="h-3 w-3 text-white mx-auto animate-spin" />
                ) : (
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${s.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
