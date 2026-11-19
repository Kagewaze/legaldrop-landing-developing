// Adopted, test-only, from the fresh-context D7c review runtime harness.
// Presentational stand-in for the price table.
import { createElement } from 'react'

export function PriceBreakdown({ quote }) {
  return createElement('div', { 'data-fake': 'price-breakdown' }, `total ${quote?.total}`)
}
export function formatMoney(value) {
  return '$' + Number(value).toFixed(2)
}
