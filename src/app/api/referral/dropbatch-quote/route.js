import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'
import { REFERRAL_COOKIE } from '@/lib/referral-continuity.mjs'
import { customerDropBatchQuote } from '@/lib/dropbatch-referral-quote.mjs'

export async function POST(request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return new Response(null, { status: 401 })

  let body
  try { body = await request.json() } catch {
    return Response.json({ message: 'Invalid request' }, { status: 400 })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return Response.json({ message: 'Invalid request' }, { status: 400 })

  // The browser cannot supply referral authority. Only the HttpOnly cookie can.
  const { referralSessionReference: _ignored, ...pricingBody } = body
  const reference = cookies().get(REFERRAL_COOKIE)?.value
  let response
  try {
    response = await fetch(API_BASE_URL + '/drop-batch/public/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authorization },
      body: JSON.stringify(reference
        ? { ...pricingBody, referralSessionReference: reference }
        : pricingBody),
      cache: 'no-store',
    })
  } catch {
    return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  }
  if (!response.ok) {
    if (reference) return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
    return new Response(await response.arrayBuffer(), {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    })
  }
  let payload
  try { payload = await response.json() } catch {
    return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  }
  const quote = customerDropBatchQuote(payload?.data ?? payload, Boolean(reference))
  if (!quote) return Response.json({ message: 'Quote temporarily unavailable' }, { status: 503 })
  return Response.json({ data: quote }, { headers: { 'Cache-Control': 'no-store' } })
}
