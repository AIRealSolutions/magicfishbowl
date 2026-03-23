'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Tag, Users, ScanLine, CreditCard,
  LogOut, Menu, X, UserCog, ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SubscriptionTier, SubscriptionStatus } from '@/lib/supabase/types'

interface Merchant {
  id: string
  business_name: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  logo_url: string | null
}

const NAV = [
  { href: '/biz/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/biz/offers', label: 'Offers', icon: Tag },
  { href: '/biz/contacts', label: 'Contacts', icon: Users },
  { href: '/biz/scan', label: 'Scanner', icon: ScanLine },
  { href: '/biz/staff', label: 'Staff', icon: UserCog },
  { href: '/biz/billing', label: 'Billing', icon: CreditCard },
]

export default function BizNav({ merchant }: { merchant: Merchant }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/biz')
  }

  const tierColor = {
    starter: 'badge-blue',
    pro: 'badge-green',
    agency: 'badge-yellow',
  }[merchant.subscription_tier]

  const NavLinks = () => (
    <>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-brand-50 text-brand-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-gray-100 bg-white px-3 py-6 sticky top-0 h-screen">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🐟</span>
            <span className="font-bold text-gray-900 text-sm truncate">{merchant.business_name}</span>
          </div>
          <span className={cn('badge text-xs', tierColor)}>{merchant.subscription_tier}</span>
          {merchant.subscription_status === 'trialing' && merchant.trial_ends_at && (
            <div className="text-xs text-gray-400 mt-1">
              Trial ends {new Date(merchant.trial_ends_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐟</span>
          <span className="font-bold text-sm text-gray-900 truncate max-w-[140px]">{merchant.business_name}</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
          <div className="w-64 bg-white flex flex-col px-3 py-6 mt-[57px]">
            <nav className="flex-1 space-y-1">
              <NavLinks />
            </nav>
            <div className="border-t border-gray-100 pt-3">
              <button onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-100">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile spacer */}
      <div className="md:hidden h-[57px]" />
    </>
  )
}
