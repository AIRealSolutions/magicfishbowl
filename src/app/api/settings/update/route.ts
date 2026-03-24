import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { business_name, category, address, logo_url, hours } = body

    if (!business_name || !category) {
      return NextResponse.json({ error: 'Business name and category are required' }, { status: 400 })
    }

    // Geocode address if provided
    let lat: number | null = null
    let lng: number | null = null
    if (address && address.trim()) {
      const encoded = encodeURIComponent(address.trim())
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      if (mapboxToken) {
        const geoRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${mapboxToken}&limit=1`
        )
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          const feature = geoData.features?.[0]
          if (feature) {
            lng = feature.center[0]
            lat = feature.center[1]
          }
        }
      }
    }

    const service = await createServiceClient()
    const { error } = await service
      .from('merchants')
      .update({
        business_name,
        category,
        address: address || null,
        logo_url: logo_url || null,
        hours: hours ?? null,
        ...(lat !== null && lng !== null ? { lat, lng } : {}),
      })
      .eq('owner_user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Settings update error:', err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
