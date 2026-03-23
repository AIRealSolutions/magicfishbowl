import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BizNav from './BizNav'

export default async function BizLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, subscription_tier, subscription_status, trial_ends_at, logo_url')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BizNav merchant={merchant} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
