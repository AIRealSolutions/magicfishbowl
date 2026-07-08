import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { business_name, category, address, subscription_tier, subscription_status } = body

    // Verify required fields
    if (!business_name || !category) {
      return NextResponse.json(
        { error: 'Business name and category are required' },
        { status: 400 }
      )
    }

    // Get the current user from the auth cookie
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            )
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client for inserting (bypasses RLS)
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    // Create merchant record
    const { data, error } = await adminSupabase.from('merchants').insert({
      owner_user_id: user.id,
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
