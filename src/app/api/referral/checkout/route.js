import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/lib/config'
import { REFERRAL_COOKIE } from '@/lib/referral-continuity.mjs'

export async function POST(request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer '))
    return new Response(null, { status: 401 })
  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Invalid request' }, { status: 400 })
  }
  const reference = cookies().get(REFERRAL_COOKIE)?.value
  const payload = reference
    ? { ...body, referralSessionReference: reference }
    : body
  const response = await fetch(API_BASE_URL + '/order/get-fee', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('content-type') || 'application/json',
    },
  })
}
