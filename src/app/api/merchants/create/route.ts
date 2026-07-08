import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business_name, category, address, subscription_tier, subscription_status, user_id } = body

    // Verify required fields
    if (!business_name || !category || !user_id) {
      return NextResponse.json(
        { error: 'Business name, category, and user_id are required' },
        { status: 400 }
      )
    }

    // Use admin client for inserting (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, verify the auth user exists
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(user_id)

    if (authCheckError || !authUser.user) {
      console.error('Auth user verification failed:', authCheckError)
      return NextResponse.json(
        {
          error: 'Your account is not yet fully created. Please try signing up again or refresh and wait a moment before clicking "Start Free Trial".',
          details: authCheckError?.message
        },
        { status: 400 }
      )
    }

    // Create merchant record
    const { data, error } = await supabase.from('merchants').insert({
      owner_user_id: user_id,
      business_name,
      category,
      address: address || null,
      subscription_tier: subscription_tier || 'starter',
      subscription_status: subscription_status || 'trialing',
    }).select()

    if (error) {
      console.error('Merchant creation error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create merchant' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, merchant: data?.[0] })
  } catch (err) {
    console.error('Merchant creation API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
