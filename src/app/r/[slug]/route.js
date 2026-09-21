import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/config'
import { publicCapture, REFERRAL_COOKIE } from '@/lib/referral-continuity.mjs'
export const dynamic = 'force-dynamic'
export async function GET(request, { params }) {
  const destination = new URL('/send', 'https://druppr.ca')
  try {
    const response = await fetch(
      API_BASE_URL + '/public/referrals/' + encodeURIComponent(params.slug) + '/resolve',
      {
        method: 'POST',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
        headers: {
          ...(request.headers.get('cf-connecting-ip')
            ? { 'cf-connecting-ip': request.headers.get('cf-connecting-ip') }
            : {}),
        },
      }
    )
    if (!response.ok) throw new Error('Unavailable')
    const capture = publicCapture((await response.json()).data)
    // This is display/navigation metadata only. The HttpOnly cookie remains the
    // sole pricing and attribution authority.
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(params.slug))
      destination.searchParams.set('via', params.slug)
    const result = NextResponse.redirect(destination, 303)
    result.cookies.set(REFERRAL_COOKIE, capture.reference, {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      expires: capture.expires,
    })
    result.headers.set('Cache-Control', 'no-store')
    result.headers.set('Referrer-Policy', 'no-referrer')
    return result
  } catch {
    destination.searchParams.set('referral', 'unavailable')
    const result = NextResponse.redirect(destination, 303)
    result.cookies.set(REFERRAL_COOKIE, '', {
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    })
    result.headers.set('Cache-Control', 'no-store')
    return result
  }
}
