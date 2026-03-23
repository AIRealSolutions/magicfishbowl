import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VirtualCard from './VirtualCard'

export default async function CardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/join')

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/join')

  // Fetch recent redemptions
  const { data: redemptions } = await supabase
    .from('redemptions')
    .select(`
      id, confirmed_at, scan_method,
      offers ( title ),
      merchants ( business_name, category )
    `)
    .eq('member_id', member.id)
    .eq('status', 'confirmed')
    .order('confirmed_at', { ascending: false })
    .limit(10)

  return <VirtualCard member={member} redemptions={redemptions ?? []} />
}
