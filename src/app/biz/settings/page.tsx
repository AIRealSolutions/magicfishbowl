import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, category, address, lat, lng, logo_url, hours')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  return <SettingsForm merchant={merchant} />
}
