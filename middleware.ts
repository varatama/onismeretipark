import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Use the public environment variables for Supabase connection
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Refresh session if expired - mandatory for @supabase/ssr
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Public/Exception routes
    const isAuthPage = pathname.startsWith('/belepes') || pathname.startsWith('/auth')
    const isPublicAsset = pathname.startsWith('/img') || pathname.startsWith('/api') || pathname === '/favicon.ico'
    const isLanding = pathname === '/'
    const isSubscriptionPage = pathname.startsWith('/elofizetes')

    // 1. AUTH PROTECTION
    // If no user and trying to access protected routes, redirect to login
    if (!user && !isAuthPage && !isPublicAsset && !isLanding) {
        const url = request.nextUrl.clone()
        url.pathname = '/belepes'
        return NextResponse.redirect(url)
    }

    // 2. TRIAL GUARD & ROLE CHECK
    if (user && !isAuthPage && !isPublicAsset && !isLanding && !isSubscriptionPage) {
        // Fetch user profile status
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, plan, trial_expires_at')
            .eq('id', user.id)
            .single()

        if (profile) {
            // Admin Protection
            if (pathname.startsWith('/admin') && profile.role !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/park'
                return NextResponse.redirect(url)
            }

            // Trial Guard
            const isPremium = profile.plan === 'premium'
            const trialExpiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at) : null
            const isTrialExpired = trialExpiresAt ? trialExpiresAt < new Date() : false

            // If trial expired and not premium, force redirect to /elofizetes
            if (!isPremium && isTrialExpired) {
                const url = request.nextUrl.clone()
                url.pathname = '/elofizetes'
                // Pass a query param so the UI can show a friendly "Trial expired" message
                url.searchParams.set('reason', 'expired')
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
