import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateOtp } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json()
    if (!phone || !email) {
      return NextResponse.json({ error: 'Phone and email required' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Check unique email + phone constraint before sending OTP
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json({ error: 'An account with this email or phone already exists. Sign in instead.' }, { status: 409 })
    }

    // Generate and hash OTP
    const otp = generateOtp()
    const otp_hash = await bcrypt.hash(otp, 10)

    // Expire previous OTPs for this phone
    await supabase
      .from('phone_otps')
      .update({ used: true })
      .eq('phone', phone)
      .eq('used', false)

    // Store new OTP
    await supabase.from('phone_otps').insert({ phone, otp_hash })

    // Send via Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    await client.messages.create({
      body: `Your MagicFishbowl verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('OTP send error:', err)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
