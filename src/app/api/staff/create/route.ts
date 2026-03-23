import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { merchant_id, full_name, pin } = await req.json()

    if (!merchant_id || !full_name || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be 4-6 digits' }, { status: 400 })
    }

    // Verify the requesting user owns the merchant
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createServiceClient()
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, subscription_tier')
      .eq('id', merchant_id)
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

    // Check seat limit
    const seatLimits: Record<string, number> = { starter: 2, pro: 10, agency: Infinity }
    const maxSeats = seatLimits[merchant.subscription_tier] ?? 2
    const { count } = await supabase
      .from('merchant_staff')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)

    if (maxSeats !== Infinity && (count ?? 0) >= maxSeats) {
      return NextResponse.json({ error: `Staff seat limit reached for your plan (${maxSeats} max). Upgrade to add more.` }, { status: 400 })
    }

    const pin_hash = await bcrypt.hash(pin, 12)

    const { data: staff, error } = await supabase
      .from('merchant_staff')
      .insert({ merchant_id, full_name, pin_hash })
      .select('id, full_name, is_active, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ staff })
  } catch (err: unknown) {
    console.error('Staff create error:', err)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}
