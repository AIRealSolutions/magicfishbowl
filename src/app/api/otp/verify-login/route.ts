import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()
    if (!phone || !otp) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = await createServiceClient()

    // Verify OTP
    const { data: otpRecord } = await supabase
      .from('phone_otps')
      .select('*')
      .eq('phone', phone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!otpRecord) {
      return NextResponse.json({ error: 'Code expired or not found. Request a new one.' }, { status: 400 })
    }

    const valid = await bcrypt.compare(otp, otpRecord.otp_hash)
    if (!valid) return NextResponse.json({ error: 'Incorrect code.' }, { status: 400 })

    await supabase.from('phone_otps').update({ used: true }).eq('id', otpRecord.id)

    // Fetch member
    const { data: member } = await supabase
      .from('members')
      .select('id, user_id, email')
      .eq('phone', phone)
      .single()

    if (!member?.user_id) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
    }

    // Set a fresh temp password so client can sign in
    const temp_password = uuidv4()
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      member.user_id,
      { password: temp_password }
    )
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: member.email, temp_password })
  } catch (err: unknown) {
    console.error('Login OTP verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
