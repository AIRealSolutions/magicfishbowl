import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

export async function GET(req: NextRequest) {
  try {
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/biz?login=1', req.url))

    const supabase = await createServiceClient()
    const { data: merchant } = await supabase
      .from('merchants')
      .select('stripe_customer_id')
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/biz/billing', req.url))
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: merchant.stripe_customer_id,
      return_url: `${appUrl}/biz/billing`,
    })

    return NextResponse.redirect(session.url)
  } catch (err: unknown) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 })
  }
}
