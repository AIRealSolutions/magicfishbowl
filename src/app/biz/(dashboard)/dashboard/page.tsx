import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/biz?login=1')

  // Try to get merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, trial_ends_at, subscription_status, subscription_tier, is_live, business_name')
    .eq('owner_user_id', user.id)
    .single()

  // If no merchant exists, show setup page instead of redirecting
  if (!merchant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🐟</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            Your account is created, but your business setup didn't complete. This is a temporary issue we're fixing.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            For now, please email support or try signing up again with a different email address.
          </p>
          <div className="space-y-3">
            <Link 
              href="/biz"
              className="block w-full bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-700 font-semibold"
            >
              Try Again
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                redirect('/biz')
              }}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {merchant.business_name}!</h1>
        <p className="text-gray-600 mt-2">Your dashboard is loading...</p>
      </div>
    </div>
  )
}
