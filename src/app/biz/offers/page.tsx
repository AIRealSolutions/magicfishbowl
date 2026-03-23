import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import OfferToggle from './OfferToggle'

export default async function OffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, subscription_tier')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  const tierLimits = { starter: 1, pro: 5, agency: Infinity }
  const maxOffers = tierLimits[merchant.subscription_tier as keyof typeof tierLimits] ?? 1
  const activeCount = offers?.filter((o) => o.is_active).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} / {maxOffers === Infinity ? '∞' : maxOffers} active on your plan
          </p>
        </div>
        {(maxOffers === Infinity || activeCount < maxOffers) && (
          <Link href="/biz/offers/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Offer
          </Link>
        )}
      </div>

      {!offers || offers.length === 0 ? (
        <div className="card text-center py-16">
          <Tag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No offers yet</h2>
          <p className="text-sm text-gray-400 mb-6">Create your first offer to appear on the consumer map.</p>
          <Link href="/biz/offers/new" className="btn-primary inline-flex">
            <Plus className="h-4 w-4" />
            Create First Offer
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="card flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-gray-900">{offer.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{offer.description}</div>
                  </div>
                  <OfferToggle offerId={offer.id} isActive={offer.is_active} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge badge-blue">
                    {offer.offer_type === 'giveaway' ? 'Free Item' : `${offer.discount_value}% Off`}
                  </span>
                  <span className="badge badge-gray">{offer.cooldown_days}d cooldown</span>
                  {offer.max_total_uses && (
                    <span className="badge badge-gray">
                      {offer.total_redeemed}/{offer.max_total_uses} uses
                    </span>
                  )}
                  {offer.expires_at && (
                    <span className="badge badge-yellow">
                      Expires {new Date(offer.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCount >= maxOffers && maxOffers !== Infinity && (
        <div className="mt-4 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          You&apos;ve reached your plan&apos;s offer limit.{' '}
          <Link href="/biz/billing" className="font-semibold underline">Upgrade</Link> to add more.
        </div>
      )}
    </div>
  )
}
