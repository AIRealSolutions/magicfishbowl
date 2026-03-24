import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Clock, Tag } from 'lucide-react'
import { CATEGORIES } from '@/lib/utils'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default async function SubdomainPage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const supabase = await createServiceClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, category, address, logo_url, hours')
    .eq('subdomain', subdomain)
    .eq('is_active', true)
    .single()

  if (!merchant) notFound()

  const { data: offers } = await supabase
    .from('offers')
    .select('id, title, description, discount_value, discount_type, expires_at')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const categoryLabel = CATEGORIES.find((c) => c.value === merchant.category)?.label ?? merchant.category

  type DayHours = { open: string; close: string; closed: boolean }
  const hours = merchant.hours as Record<string, DayHours> | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {merchant.logo_url ? (
              <img src={merchant.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl">🏪</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{merchant.business_name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm text-gray-500">{categoryLabel}</span>
            </div>
            {merchant.address && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{merchant.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Offers */}
        {offers && offers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Offers</h2>
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{offer.title}</div>
                      {offer.description && (
                        <p className="text-sm text-gray-500 mt-1">{offer.description}</p>
                      )}
                      {offer.expires_at && (
                        <p className="text-xs text-gray-400 mt-2">
                          Expires {new Date(offer.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 bg-brand-50 text-brand-700 font-bold text-lg rounded-xl px-3 py-1.5 whitespace-nowrap">
                      {offer.discount_type === 'percent'
                        ? `${offer.discount_value}% OFF`
                        : offer.discount_type === 'fixed'
                        ? `$${offer.discount_value} OFF`
                        : offer.discount_value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hours */}
        {hours && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Hours of Operation</h2>
            </div>
            <div className="space-y-2">
              {DAYS.map((key) => {
                const day = hours[key]
                if (!day) return null
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 w-28">{DAY_LABELS[key]}</span>
                    {day.closed ? (
                      <span className="text-gray-400 italic">Closed</span>
                    ) : (
                      <span className="text-gray-600">
                        {formatTime(day.open)} – {formatTime(day.close)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by{' '}
          <a href="https://magicfishbowl.com" className="text-brand-600 hover:underline">
            MagicFishbowl
          </a>
        </p>
      </div>
    </div>
  )
}
