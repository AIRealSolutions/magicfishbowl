import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.merchant_id) {
        await supabase.from('merchants').update({
          subscription_status: 'trialing',
          stripe_subscription_id: session.subscription as string,
          subscription_tier: session.metadata.plan ?? 'starter',
        }).eq('id', session.metadata.merchant_id)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

      if (merchant) {
        const status = sub.status === 'trialing' ? 'trialing'
          : sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : 'canceled'

        await supabase.from('merchants').update({
          subscription_status: status,
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        }).eq('id', merchant.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('stripe_customer_id', sub.customer as string)
        .single()

      if (merchant) {
        await supabase.from('merchants').update({
          subscription_status: 'canceled',
          is_live: false,
        }).eq('id', merchant.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
