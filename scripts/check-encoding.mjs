#!/usr/bin/env node
// Fails if any source file contains mojibake or a UTF-8 BOM.
//
// WHY THIS EXISTS. `src/app/send/details/page.jsx` and `src/lib/send-flow.js` were committed
// with their non-ASCII characters double-encoded: a UTF-8 file had been read back as
// CP1252/latin-1 and re-saved as UTF-8. The minus sign on the package stepper (U+2212) was
// stored as U+00E2 U+02C6 U+2019 and shipped to production as "âˆ’"; the weight label's en
// dash (U+2013) became U+00E2 U+20AC U+201C and shipped as "15â€“30 kg". Both files also
// carried a BOM, the fingerprint of the same bad write.
//
// The build and the browser were faithful — they rendered exactly what was committed — so
// nothing downstream could have caught this. The only place to catch it is the bytes.
//
// DETECTION IS BY ROUND-TRIP, NOT BY BLOCKLIST. Listing known-bad sequences would miss the
// next character someone mangles. Instead every run of non-ASCII is pushed back through the
// inverse of the corruption: map each character to the byte a CP1252/latin-1 reader would
// have produced, then try to decode those bytes as UTF-8. Text that was never mangled fails
// that decode and is left alone; text that WAS mangled decodes cleanly into the character it
// should have been, which is proof rather than suspicion.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md']

// CP1252's high range: the characters a CP1252 reader produces for bytes 0x80-0x9F. Bytes
// outside that range map to their own code point, which is the latin-1 fallback the original
// bad reader used (0x8F survived as U+008F, which strict CP1252 would have rejected).
const CP1252_HIGH = new Map([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
  [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
  [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
  [0x017e, 0x9e], [0x0178, 0x9f],
])

function toLegacyByte(codePoint) {
  const mapped = CP1252_HIGH.get(codePoint)
  if (mapped !== undefined) return mapped
  return codePoint < 0x100 ? codePoint : null
}

// Returns the repaired text if `run` is mojibake, otherwise null.
function decodeMojibake(run) {
  const bytes = []
  for (const char of run) {
    const byte = toLegacyByte(char.codePointAt(0))
    if (byte === null) return null
    bytes.push(byte)
  }
  let decoded
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes))
  } catch {
    return null // not valid UTF-8 underneath, so it was never mangled
  }
  return decoded === run ? null : decoded
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) yield full
  }
}

const problems = []

for (const file of walk(SRC)) {
  const raw = readFileSync(file)
  const rel = relative(ROOT, file)

  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    problems.push(`${rel}: starts with a UTF-8 BOM`)
  }

  const text = raw.toString('utf8')
  for (const match of text.matchAll(/[^\x00-\x7f]+/g)) {
    const repaired = decodeMojibake(match[0])
    if (repaired === null) continue
    const line = text.slice(0, match.index).split('\n').length
    problems.push(`${rel}:${line}: mojibake — found ${JSON.stringify(match[0])}, should be ${JSON.stringify(repaired)}`)
  }
}

if (problems.length > 0) {
  console.error('Encoding check failed:\n')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error(
    '\nThese files were saved by a tool that read UTF-8 as CP1252. Re-save as UTF-8 without a BOM.'
  )
  process.exit(1)
}

console.log('Encoding check passed: no mojibake, no BOMs.')
