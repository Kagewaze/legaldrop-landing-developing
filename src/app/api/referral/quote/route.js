import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'
import { REFERRAL_COOKIE } from '@/lib/referral-continuity.mjs'

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
  const quote = payload?.data ?? payload
  const minor = quote?.finalCustomerTotalMinor
  const lines = quote?.lineItems
  const keys = ['base', 'distance', 'extraPackage', 'labour', 'heavyFee', 'serviceFee']
  const validLines = lines && keys.every(key =>
    lines[key] === undefined || (Number.isFinite(lines[key]) && lines[key] >= 0))
  const sumMinor = validLines
    ? keys.reduce((sum, key) => sum + Math.round((lines[key] ?? 0) * 100), 0)
    : NaN
  if (!Number.isSafeInteger(minor) || minor < 0 || quote?.currency !== 'CAD' ||
      sumMinor !== minor || !Number.isFinite(quote?.distanceKm)) {
    return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  }
  const lineItems = Object.fromEntries(keys.map(key => [key, lines[key] ?? 0]))
  return Response.json({ data: {
    lineItems, total: minor / 100, finalCustomerTotalMinor: minor,
    currency: 'CAD', distanceKm: quote.distanceKm, vehicle: quote.vehicle,
  } }, { headers: { 'Cache-Control': 'no-store' } })
}
