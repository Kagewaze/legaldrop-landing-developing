// Visible navigation context only. This value never enters a pricing/order request.
export function bookingHrefWithVia(href, search = '') {
  const url = new URL(href, 'https://druppr.ca')
  if (!['/send', '/send/details', '/send/pay', '/drop-batch/request'].includes(url.pathname)) return href
  const from = new URLSearchParams(search)
  const via = from.get('via')
  if (via && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(via) && !url.searchParams.has('via'))
    url.searchParams.set('via', via)
  return url.pathname + url.search + url.hash
}
