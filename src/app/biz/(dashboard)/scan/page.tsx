import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScannerClient from './ScannerClient'

export default async function ScanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  const { data: staff } = await supabase
    .from('merchant_staff')
    .select('id, full_name')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)

  const { data: offers } = await supabase
    .from('offers')
    .select('id, title, offer_type, discount_value, cooldown_days')
    .eq('merchant_id', merchant.id)
    .eq('is_active', true)

  return (
    <ScannerClient
      merchantId={merchant.id}
      merchantName={merchant.business_name}
      staff={staff ?? []}
      offers={offers ?? []}
    />
  )
}
