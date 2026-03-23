import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const merchantId = req.nextUrl.searchParams.get('merchant_id')
    if (!merchantId) return NextResponse.json({ error: 'merchant_id required' }, { status: 400 })

    const supabase = await createServiceClient()

    // Verify ownership
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id, business_name')
      .eq('id', merchantId)
      .eq('owner_user_id', user.id)
      .single()

    if (!merchant) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { data: contacts } = await supabase
      .from('crm_contacts')
      .select('full_name, email, phone, source, tags, created_at, last_contacted_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (!contacts) return NextResponse.json({ error: 'No contacts' }, { status: 404 })

    // Build CSV
    const headers = ['Full Name', 'Email', 'Phone', 'Source', 'Tags', 'Added Date', 'Last Contacted']
    const rows = contacts.map((c) => [
      c.full_name,
      c.email,
      c.phone ?? '',
      c.source,
      (c.tags ?? []).join(';'),
      new Date(c.created_at).toLocaleDateString(),
      c.last_contacted_at ? new Date(c.last_contacted_at).toLocaleDateString() : '',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const filename = `${merchant.business_name.replace(/[^a-z0-9]/gi, '_')}_contacts_${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: unknown) {
    console.error('CSV export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
