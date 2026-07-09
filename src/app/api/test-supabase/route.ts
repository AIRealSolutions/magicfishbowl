import { NextResponse } from 'next/server'

export async function GET() {
  const config = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    serviceRoleKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  return NextResponse.json({
    status: 'ok',
    config,
    timestamp: new Date().toISOString(),
  })
}
