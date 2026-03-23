import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { token, merchant_id, offer_id, method } = await req.json()

    if (!token || !merchant_id || !offer_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Lookup member by QR or NFC token
    const tokenField = method === 'nfc' ? 'nfc_token' : 'qr_token'
    const { data: member } = await supabase
      .from('members')
      .select('id, full_name, email, phone, phone_verified')
      .eq(tokenField, token)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Invalid card. Member not found.' }, { status: 404 })
    }

    if (!member.phone_verified) {
      return NextResponse.json({ error: 'Member phone not verified.' }, { status: 403 })
    }

    // Fraud check: duplicate scan within 60 seconds
    const { data: recentScan } = await supabase
      .from('redemptions')
      .select('id, scanned_at, merchant_id')
      .eq('member_id', member.id)
      .eq('status', 'pending_pin')
      .gte('scanned_at', new Date(Date.now() - 60000).toISOString())
      .limit(1)
      .maybeSingle()

    if (recentScan) {
      // Flag as duplicate
      await supabase.from('duplicate_scan_flags').insert({
        qr_token: token,
        first_scan_at: recentScan.scanned_at,
        second_scan_at: new Date().toISOString(),
        merchant_id,
      })
      return NextResponse.json({ error: 'Duplicate scan detected. Please wait before scanning again.' }, { status: 429 })
    }

    // Fetch offer and validate
    const { data: offer } = await supabase
      .from('offers')
      .select('id, title, offer_type, discount_value, cooldown_days, max_total_uses, total_redeemed, per_member_limit, expires_at, is_active')
      .eq('id', offer_id)
      .eq('merchant_id', merchant_id)
      .single()

    if (!offer || !offer.is_active) {
      return NextResponse.json({ error: 'Offer is not active.' }, { status: 404 })
    }

    // Check expiration
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Offer has expired.' }, { status: 400 })
    }

    // Check max total uses
    if (offer.max_total_uses !== null && offer.total_redeemed >= offer.max_total_uses) {
      return NextResponse.json({ error: 'Offer has reached its maximum number of uses.' }, { status: 400 })
    }

    // Check per-member limit and cooldown
    const { data: pastRedemptions } = await supabase
      .from('redemptions')
      .select('id, confirmed_at')
      .eq('member_id', member.id)
      .eq('offer_id', offer_id)
      .eq('status', 'confirmed')
      .order('confirmed_at', { ascending: false })

    const redemptionCount = pastRedemptions?.length ?? 0

    if (redemptionCount >= offer.per_member_limit) {
      return NextResponse.json({ error: `You've already redeemed this offer the maximum number of times.` }, { status: 400 })
    }

    if (pastRedemptions && pastRedemptions.length > 0) {
      const lastRedemption = pastRedemptions[0]
      if (lastRedemption.confirmed_at) {
        const daysSinceLast = (Date.now() - new Date(lastRedemption.confirmed_at).getTime()) / 86400000
        if (daysSinceLast < offer.cooldown_days) {
          const daysLeft = Math.ceil(offer.cooldown_days - daysSinceLast)
          return NextResponse.json({ error: `Cooldown active. Come back in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.` }, { status: 400 })
        }
      }
    }

    // Create pending redemption
    const { data: redemption, error: insertError } = await supabase
      .from('redemptions')
      .insert({
        member_id: member.id,
        merchant_id,
        offer_id,
        status: 'pending_pin',
        scan_method: method ?? 'qr',
      })
      .select('id')
      .single()

    if (insertError || !redemption) {
      return NextResponse.json({ error: 'Failed to create redemption.' }, { status: 500 })
    }

    return NextResponse.json({
      member: { full_name: member.full_name, email: member.email, phone: member.phone },
      offer: { id: offer.id, title: offer.title },
      redemption_id: redemption.id,
    })
  } catch (err: unknown) {
    console.error('Scan lookup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
