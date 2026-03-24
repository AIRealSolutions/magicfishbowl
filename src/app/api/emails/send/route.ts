import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subject, body } = await req.json()
    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
    }

    const service = await createServiceClient()

    // Get merchant
    const { data: merchant } = await service
      .from('merchants')
      .select('id, business_name')
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

    // Get opted-in contacts with emails
    const { data: contacts } = await service
      .from('crm_contacts')
      .select('email, full_name')
      .eq('merchant_id', merchant.id)
      .eq('email_opt_in', true)
      .not('email', 'is', null)

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No opted-in contacts with email addresses' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send in batches of 50 (Resend batch limit)
    const BATCH = 50
    let sent = 0
    for (let i = 0; i < contacts.length; i += BATCH) {
      const batch = contacts.slice(i, i + BATCH)
      const emails = batch.map((c) => ({
        from: `${merchant.business_name} via MagicFishbowl <noreply@magicfishbowl.com>`,
        to: c.email as string,
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <p>${body.replace(/\n/g, '<br/>')}</p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="font-size:12px;color:#9ca3af">
            You're receiving this because you opted in at ${merchant.business_name}.<br/>
            To unsubscribe, reply STOP.
          </p>
        </div>`,
      }))
      await resend.batch.send(emails)
      sent += batch.length
    }

    return NextResponse.json({ success: true, sent })
  } catch (err: unknown) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
