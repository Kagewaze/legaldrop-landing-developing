// Stands in for src/lib/send-flow.js during tests, and ONLY because that module also defines
// the React SendFlowContext provider — node --test cannot parse JSX, so importing the real
// file would fail at load time and no payload test could run at all.
//
// buildOrderPayload imports exactly one thing from it, weightKgFor. The stub returns a
// SENTINEL rather than a plausible weight so a test can prove the value was threaded through
// from weightKgFor(flow.weight) rather than hardcoded — while making it obvious that the real
// kg lookup table is NOT what these tests cover. A1 does not touch that table.

export const WEIGHT_SENTINEL = 987654

export const weightKgForCalls = []

export function weightKgFor(weightId) {
  weightKgForCalls.push(weightId)
  return WEIGHT_SENTINEL
}
