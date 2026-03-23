import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { staff_id, is_active } = await req.json()

    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createServiceClient()

    // Verify ownership via merchant join
    const { data: staff } = await supabase
      .from('merchant_staff')
      .select('id, merchant_id')
      .eq('id', staff_id)
      .single()

    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('id', staff.merchant_id)
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    await supabase.from('merchant_staff').update({ is_active }).eq('id', staff_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
