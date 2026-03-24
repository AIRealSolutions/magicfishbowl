import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOtp } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    const supabase = await createServiceClient()

    // Verify the member exists
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (!member) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Sign up instead.' },
        { status: 404 }
      )
    }

    const otp = generateOtp()
    const otp_hash = await bcrypt.hash(otp, 10)

    await supabase.from('phone_otps').update({ used: true }).eq('phone', phone).eq('used', false)
    await supabase.from('phone_otps').insert({ phone, otp_hash })

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    await client.messages.create({
      body: `Your MagicFishbowl sign-in code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Login OTP send error:', err)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
