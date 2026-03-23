import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ScanLine, Tag, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, trial_ends_at, subscription_status, subscription_tier, is_live')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  // Fetch stats in parallel
  const [contactsRes, redemptionsRes, offersRes] = await Promise.all([
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('merchant_id', merchant.id),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('status', 'confirmed'),
    supabase.from('offers').select('id', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('is_active', true),
  ])

  // Last 5 redemptions
  const { data: recentRedemptions } = await supabase
    .from('redemptions')
    .select(`
      id, confirmed_at, scan_method,
      members ( full_name ),
      offers ( title )
    `)
    .eq('merchant_id', merchant.id)
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: false })
    .limit(5)

  const trialDaysLeft = merchant.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(merchant.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const stats = [
    { label: 'Total Contacts', value: contactsRes.count ?? 0, icon: <Users className="h-5 w-5 text-brand-600" />, href: '/biz/contacts' },
    { label: 'Confirmed Scans', value: redemptionsRes.count ?? 0, icon: <ScanLine className="h-5 w-5 text-green-600" />, href: null },
    { label: 'Active Offers', value: offersRes.count ?? 0, icon: <Tag className="h-5 w-5 text-purple-600" />, href: '/biz/offers' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Trial banner */}
      {merchant.subscription_status === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-yellow-800">
            <strong>Trial ending in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}.</strong>
            {' '}Add a payment method to keep your account active.
          </div>
          <Link href="/biz/billing" className="text-sm font-semibold text-yellow-700 hover:text-yellow-900">
            Add Card →
          </Link>
        </div>
      )}

      {/* Not live banner */}
      {!merchant.is_live && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
          <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-blue-800">
            <strong>You&apos;re not live yet.</strong> Create an offer to appear on the consumer discovery map.
          </div>
          <Link href="/biz/offers/new" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            Create Offer →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                {s.icon}
              </div>
              {s.href && (
                <Link href={s.href} className="text-xs text-brand-600 hover:underline">View all</Link>
              )}
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/biz/scan" className="card flex items-center gap-4 hover:shadow-md transition group">
          <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <ScanLine className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Open Scanner</div>
            <div className="text-xs text-gray-400">Scan member QR codes in-store</div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition" />
        </Link>
        <Link href="/biz/offers/new" className="card flex items-center gap-4 hover:shadow-md transition group">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Tag className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Create Offer</div>
            <div className="text-xs text-gray-400">Add a new giveaway or discount</div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition" />
        </Link>
      </div>

      {/* Recent redemptions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Redemptions</h2>
        </div>
        {!recentRedemptions || recentRedemptions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No redemptions yet. Share your scanner link and get customers scanning!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentRedemptions.map((r) => (
              <div key={r.id} className="py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-600">
                  {(r.members as unknown as { full_name: string } | null)?.full_name?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {(r.members as unknown as { full_name: string } | null)?.full_name ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {(r.offers as unknown as { title: string } | null)?.title ?? '—'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-400">
                    {r.confirmed_at ? new Date(r.confirmed_at).toLocaleDateString() : '—'}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">{r.scan_method}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
