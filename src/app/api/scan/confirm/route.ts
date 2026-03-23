import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { redemption_id, staff_id, pin, merchant_id } = await req.json()

    if (!redemption_id || !staff_id || !pin || !merchant_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Verify staff belongs to merchant and is active
    const { data: staff } = await supabase
      .from('merchant_staff')
      .select('id, pin_hash, is_active, merchant_id')
      .eq('id', staff_id)
      .eq('merchant_id', merchant_id)
      .single()

    if (!staff || !staff.is_active) {
      return NextResponse.json({ error: 'Staff member not found or inactive.' }, { status: 403 })
    }

    // Verify PIN
    const pinValid = await bcrypt.compare(pin, staff.pin_hash)
    if (!pinValid) {
      return NextResponse.json({ error: 'Incorrect PIN. Please try again.' }, { status: 401 })
    }

    // Get the pending redemption
    const { data: redemption } = await supabase
      .from('redemptions')
      .select('id, status, merchant_id, scanned_at')
      .eq('id', redemption_id)
      .eq('status', 'pending_pin')
      .eq('merchant_id', merchant_id)
      .single()

    if (!redemption) {
      return NextResponse.json({ error: 'Redemption not found or already processed.' }, { status: 404 })
    }

    // Check redemption hasn't timed out (10 minute window)
    const minutesSinceScan = (Date.now() - new Date(redemption.scanned_at).getTime()) / 60000
    if (minutesSinceScan > 10) {
      await supabase.from('redemptions').update({ status: 'flagged' }).eq('id', redemption_id)
      return NextResponse.json({ error: 'Redemption timed out. Please scan again.' }, { status: 400 })
    }

    // Confirm redemption — triggers DB functions to update CRM + offer count
    const { error: updateError } = await supabase
      .from('redemptions')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        staff_id,
      })
      .eq('id', redemption_id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to confirm redemption.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Scan confirm error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
