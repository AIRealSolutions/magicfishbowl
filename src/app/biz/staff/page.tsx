import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StaffManager from './StaffManager'

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, subscription_tier')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  const { data: staff } = await supabase
    .from('merchant_staff')
    .select('id, full_name, is_active, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: true })

  return (
    <StaffManager
      merchantId={merchant.id}
      subscriptionTier={merchant.subscription_tier}
      initialStaff={staff ?? []}
    />
  )
}
