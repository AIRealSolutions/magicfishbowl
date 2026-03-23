import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect /biz routes (merchant dashboard)
  if (pathname.startsWith('/biz/') && pathname !== '/biz' && pathname !== '/biz/signup') {
    if (!user) {
      return NextResponse.redirect(new URL('/biz?login=1', request.url))
    }
  }

  // Protect /card route (member virtual card)
  if (pathname === '/card') {
    if (!user) {
      return NextResponse.redirect(new URL('/join', request.url))
    }
  }

  // White-label subdomain detection
  const host = request.headers.get('host') ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'magicfishbowl.com'
  const rootHost = appUrl.replace(/^https?:\/\//, '')

  if (host !== rootHost && host.endsWith(`.${rootHost}`)) {
    const subdomain = host.replace(`.${rootHost}`, '')
    if (subdomain !== 'www' && subdomain !== 'staging') {
      // Rewrite to /[subdomain] route for white-label
      const url = request.nextUrl.clone()
      url.pathname = `/org/${subdomain}${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
