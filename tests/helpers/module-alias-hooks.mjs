// Module resolution hooks so node --test can import production modules that use the Next.js
// "@/" path alias and extensionless imports. Node built-ins only: no bundler, no transpiler,
// no new dependency, and no change to any production file or to package.json.
//
// Two jobs:
//   1. "@/x" resolves to src/x, adding the file extension Next resolves implicitly.
//   2. "@/lib/send-flow" is redirected to a stub, because the real module also defines the
//      React context provider and node cannot parse JSX. See send-flow-stub.mjs.
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SRC = pathToFileURL(process.cwd() + '/src/').href
const STUBS = new Map([
  ['@/lib/send-flow', new URL('./send-flow-stub.mjs', import.meta.url).href],
])

const EXTENSIONS = ['.js', '.mjs', '.jsx']

// Next resolves "./vehicles" to "./vehicles.js"; node requires the extension.
function withExtension(url) {
  if (existsSync(fileURLToPath(url))) {
    return url
  }

  for (const extension of EXTENSIONS) {
    if (existsSync(fileURLToPath(url + extension))) {
      return url + extension
    }
  }

  return url
}

export function resolve(specifier, context, next) {
  const stub = STUBS.get(specifier)

  if (stub) {
    return next(stub, context)
  }

  if (specifier.startsWith('@/')) {
    return next(withExtension(new URL(specifier.slice(2), SRC).href), context)
  }

  return next(specifier, context)
}
