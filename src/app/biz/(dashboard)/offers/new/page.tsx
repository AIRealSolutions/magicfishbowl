'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    offer_type: 'giveaway' as 'giveaway' | 'discount',
    discount_value: '',
    max_total_uses: '',
    per_member_limit: '1',
    cooldown_days: '30',
    expires_at: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('owner_user_id', user.id)
        .single()
      if (!merchant) throw new Error('Merchant not found')

      const { error } = await supabase.from('offers').insert({
        merchant_id: merchant.id,
        title: form.title,
        description: form.description || null,
        offer_type: form.offer_type,
        discount_value: form.offer_type === 'discount' && form.discount_value ? parseFloat(form.discount_value) : null,
        max_total_uses: form.max_total_uses ? parseInt(form.max_total_uses) : null,
        per_member_limit: parseInt(form.per_member_limit),
        cooldown_days: parseInt(form.cooldown_days),
        expires_at: form.expires_at || null,
        is_active: true,
      })
      if (error) throw error

      // Mark merchant as live
      await supabase.from('merchants').update({ is_live: true }).eq('id', merchant.id)

      toast.success('Offer created! You\'re now live on the map.')
      router.push('/biz/offers')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/biz/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Offers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Offer</h1>
        <p className="text-sm text-gray-500 mt-1">Define what customers receive when they scan in.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Offer Title <span className="text-red-400">*</span></label>
          <input type="text" required className="input" placeholder="e.g. Free coffee with any purchase"
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input resize-none" placeholder="Any details, exclusions, or fine print..."
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className="label">Offer Type <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'giveaway', label: '🎁 Free Item', desc: 'Give away a product or service' },
              { value: 'discount', label: '% Discount', desc: 'Offer a percentage off' },
            ] as const).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, offer_type: t.value }))}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  form.offer_type === t.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {form.offer_type === 'discount' && (
          <div>
            <label className="label">Discount Percentage <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="number" min="1" max="100" required className="input pr-8"
                placeholder="15"
                value={form.discount_value}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Per-Member Limit</label>
            <input type="number" min="1" className="input" placeholder="1"
              value={form.per_member_limit}
              onChange={(e) => setForm((f) => ({ ...f, per_member_limit: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">Max times one member can redeem</p>
          </div>
          <div>
            <label className="label">Cooldown (days)</label>
            <input type="number" min="0" className="input" placeholder="30"
              value={form.cooldown_days}
              onChange={(e) => setForm((f) => ({ ...f, cooldown_days: e.target.value }))} />
            <p className="text-xs text-gray-400 mt-1">Days between redemptions</p>
          </div>
        </div>

        <div>
          <label className="label">Max Total Uses</label>
          <input type="number" min="1" className="input" placeholder="Leave blank for unlimited"
            value={form.max_total_uses}
            onChange={(e) => setForm((f) => ({ ...f, max_total_uses: e.target.value }))} />
        </div>

        <div>
          <label className="label">Expiration Date</label>
          <input type="date" className="input"
            value={form.expires_at}
            onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? 'Creating...' : 'Create Offer & Go Live'}
        </button>
      </form>
    </div>
  )
}
