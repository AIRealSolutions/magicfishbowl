import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  agency: process.env.STRIPE_PRICE_AGENCY!,
}

export async function GET(req: NextRequest) {
  try {
    const plan = req.nextUrl.searchParams.get('plan') ?? 'starter'
    const priceId = PRICE_IDS[plan]
    if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/biz?login=1', req.url))

    const supabase = await createServiceClient()
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, stripe_customer_id')
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant) return NextResponse.redirect(new URL('/biz', req.url))

    let customerId = merchant.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { merchant_id: merchant.id } })
      customerId = customer.id
      await supabase.from('merchants').update({ stripe_customer_id: customerId }).eq('id', merchant.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      success_url: `${appUrl}/biz/billing?success=1`,
      cancel_url: `${appUrl}/biz/billing`,
      metadata: { merchant_id: merchant.id, plan },
    })

    return NextResponse.redirect(session.url!)
  } catch (err: unknown) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
