import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, CreditCard, ArrowUpRight } from 'lucide-react'
import { TIER_LIMITS, TIER_PRICES } from '@/lib/supabase/types'
import type { SubscriptionTier } from '@/lib/supabase/types'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, subscription_tier, subscription_status, trial_ends_at, stripe_customer_id')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  const tier = merchant.subscription_tier as SubscriptionTier
  const trialDaysLeft = merchant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(merchant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const tiers: SubscriptionTier[] = ['starter', 'pro', 'agency']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your subscription and payment method.</p>
      </div>

      {/* Current plan */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Current Plan</div>
            <div className="text-2xl font-extrabold text-gray-900 capitalize">{tier}</div>
            <div className="text-sm text-gray-500 mt-0.5">${TIER_PRICES[tier]}/month</div>
          </div>
          <div className="text-right">
            {merchant.subscription_status === 'trialing' ? (
              <div>
                <span className="badge badge-yellow">Trial</span>
                {trialDaysLeft !== null && (
                  <div className="text-xs text-gray-400 mt-1">{trialDaysLeft} days remaining</div>
                )}
              </div>
            ) : merchant.subscription_status === 'active' ? (
              <span className="badge badge-green">Active</span>
            ) : (
              <span className="badge badge-red capitalize">{merchant.subscription_status}</span>
            )}
          </div>
        </div>
        {merchant.stripe_customer_id && (
          <a
            href="/api/billing/portal"
            className="btn-secondary mt-4 inline-flex"
          >
            <CreditCard className="h-4 w-4" />
            Manage Payment Method
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Plan comparison */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {tier === 'agency' ? 'Your Plan Features' : 'Upgrade Your Plan'}
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((t) => {
          const limits = TIER_LIMITS[t]
          const isCurrent = t === tier
          return (
            <div key={t} className={`card border-2 transition ${isCurrent ? 'border-brand-500' : 'border-gray-100'}`}>
              {isCurrent && (
                <div className="text-xs font-bold text-brand-600 mb-2 uppercase tracking-widest">Current Plan</div>
              )}
              <div className="font-bold text-gray-900 capitalize text-lg mb-0.5">{t}</div>
              <div className="text-2xl font-extrabold text-gray-900 mb-4">
                ${TIER_PRICES[t]}<span className="text-sm font-normal text-gray-400">/mo</span>
              </div>
              <ul className="space-y-2 mb-5 text-sm">
                {[
                  `${limits.maxOffers === Infinity ? 'Unlimited' : limits.maxOffers} active offer${limits.maxOffers !== 1 ? 's' : ''}`,
                  `${limits.staffSeats === Infinity ? 'Unlimited' : limits.staffSeats} staff seats`,
                  `${limits.crmContacts === Infinity ? 'Unlimited' : limits.crmContacts.toLocaleString()} contacts`,
                  limits.sms ? 'SMS campaigns' : null,
                  limits.social ? 'Social scheduler' : null,
                  limits.twoWaySms ? '2-way SMS inbox' : null,
                  limits.whiteLabel ? 'White-label subdomain' : null,
                  limits.apiAccess ? 'API access' : null,
                ].filter(Boolean).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <a
                  href={`/api/billing/checkout?plan=${t}`}
                  className="btn-primary w-full justify-center text-sm"
                >
                  {tier === 'starter' || t > tier ? 'Upgrade' : 'Switch'} to {t}
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
