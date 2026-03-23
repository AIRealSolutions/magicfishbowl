import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'

const DiscoverClient = dynamic(() => import('./DiscoverClient'), { ssr: false })

export default async function DiscoverPage() {
  const supabase = await createClient()

  const { data: merchants } = await supabase
    .from('merchants')
    .select(`
      id, business_name, category, address, lat, lng, logo_url,
      offers ( id, title, offer_type, discount_value )
    `)
    .eq('is_live', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  const mapMerchants = (merchants ?? []).map((m) => ({
    ...m,
    offers: Array.isArray(m.offers) ? m.offers.filter((o: { is_active?: boolean }) => o.is_active !== false) : [],
  }))

  return <DiscoverClient merchants={mapMerchants} />
}
