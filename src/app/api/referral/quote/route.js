import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'
import { REFERRAL_COOKIE } from '@/lib/referral-continuity.mjs'
import { customerReferralQuote } from '@/lib/referral-quote.mjs'

export async function POST(request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return new Response(null, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Invalid request' }, { status: 400 })
  }

  // Never accept a browser-supplied capability. The HttpOnly cookie is the only source.
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return Response.json({ message: 'Invalid request' }, { status: 400 })
  const { referralSessionReference: _ignored, ...pricingBody } = body
  const reference = cookies().get(REFERRAL_COOKIE)?.value
  const response = await fetch(API_BASE_URL + '/order/quote-itemized', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authorization },
    body: JSON.stringify(reference
      ? { ...pricingBody, referralSessionReference: reference }
      : pricingBody),
    cache: 'no-store',
  })

  if (!reference) {
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  }

  // A stale backend release or expired session must never underquote a referral.
  if (!response.ok) return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  let payload
  try {
    payload = await response.json()
  } catch {
    return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  }
  // Reconciled against the backend's own total, line by line — including the minimum fare
  // adjustment when the backend applied one. Anything that does not add up is refused.
  const data = customerReferralQuote(payload?.data ?? payload)
  if (!data) {
    return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  }
  return Response.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
