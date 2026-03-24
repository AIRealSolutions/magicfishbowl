import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, full_name, email, opted_in_sms, opted_in_email } = await req.json()

    if (!phone || !otp || !full_name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Find valid OTP
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
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect verification code.' }, { status: 400 })
    }

    // Mark OTP as used
    await supabase.from('phone_otps').update({ used: true }).eq('id', otpRecord.id)

    // Check if member already exists (returning member login)
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, user_id')
      .eq('phone', phone)
      .maybeSingle()

    if (existingMember?.user_id) {
      // Returning member — reset their password so they can sign in
      const temp_password = uuidv4()
      const { error: updateError } = await supabase.auth.admin.updateUser(
        existingMember.user_id,
        { password: temp_password }
      )
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
      return NextResponse.json({ success: true, temp_password, is_returning: true })
    }

    // New member — create Supabase Auth user with temp password
    const temp_password = uuidv4()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temp_password,
      email_confirm: true,
    })
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create member record
    const { error: memberError } = await supabase.from('members').insert({
      user_id: authData.user.id,
      email,
      phone,
      full_name,
      phone_verified: true,
      opted_in_sms: opted_in_sms ?? false,
      opted_in_email: opted_in_email ?? false,
    })

    if (memberError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, temp_password })
  } catch (err: unknown) {
    console.error('OTP verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
