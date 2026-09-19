export const REFERRAL_COOKIE = 'druppr_referral'
export function publicCapture(value, now = Date.now()) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(value?.sessionReference ?? ''))
    throw new Error('Invalid referral reference')
  const expires = Date.parse(value.expiresAt)
  if (!Number.isFinite(expires) || expires <= now || value.bookingPath !== '/send')
    throw new Error('Invalid referral capture')
  return { reference: value.sessionReference, expires: new Date(expires) }
}
