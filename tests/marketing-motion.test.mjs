import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import postcss from 'postcss'

const sheet = readFileSync(
  new URL('../src/styles/tailwind.css', import.meta.url),
  'utf8',
)
const motion = postcss.parse(
  sheet.slice(sheet.indexOf('/* PUBLIC MARKETING MOTION')),
)

function guarded(node, name, condition) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (
      parent.type === 'atrule' &&
      parent.name === name &&
      parent.params.includes(condition)
    )
      return true
  }
  return false
}

test('marketing entrances are enhancement-only and reduced-motion opt-in', () => {
  let animations = 0
  motion.walkDecls('animation', (decl) => {
    if (decl.value === 'none') return
    animations++
    assert.ok(guarded(decl, 'supports', 'animation-timeline: view()'))
    assert.ok(guarded(decl, 'media', 'prefers-reduced-motion: no-preference'))
  })
  assert.ok(animations > 0)
  motion.walkDecls(/^transition/, (decl) => {
    assert.ok(guarded(decl, 'media', 'prefers-reduced-motion: no-preference'))
  })
})

test('entrance frames remain readable and never animate layout', () => {
  motion.walkAtRules('keyframes', (frames) => {
    frames.walkDecls((decl) => {
      assert.ok(['transform', 'opacity'].includes(decl.prop), decl.toString())
      if (decl.prop === 'opacity') assert.equal(Number(decl.value), 1)
    })
  })
  motion.walkDecls((decl) => {
    assert.ok(
      ![
        'display',
        'visibility',
        'pointer-events',
        'width',
        'height',
        'top',
        'left',
        'padding',
        'margin',
        'will-change',
        'animation-delay',
        'scroll-behavior',
      ].includes(decl.prop),
    )
    if (['opacity', 'transform', 'translate', 'rotate'].includes(decl.prop)) {
      const frame = decl.parent.parent
      if (frame.type !== 'atrule' || frame.name !== 'keyframes') {
        assert.match(decl.parent.selector, /:hover|:active/)
      }
    }
  })
})

test('every new style is scoped to an explicit marketing page', () => {
  motion.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && rule.parent.name === 'keyframes')
      return
    assert.ok(
      rule.selector.startsWith('[data-marketing-motion]'),
      rule.selector,
    )
    assert.doesNotMatch(
      rule.selector,
      /data-review|data-partner|\bform\b|\binput\b|\bbutton\b/,
    )
  })
  const app = new URL('../src/app/', import.meta.url)
  const root = fileURLToPath(app)
  const optedIn = []
  function visit(dir) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, item.name)
      if (item.isDirectory()) visit(path)
      else if (
        item.name.endsWith('.jsx') &&
        readFileSync(path, 'utf8').includes('data-marketing-motion')
      )
        optedIn.push(relative(root, path).replaceAll('\\', '/'))
    }
  }
  visit(root)
  assert.deepEqual(
    optedIn.sort(),
    [
      '(main)/drop-batch/page.jsx',
      '(main)/legal/page.jsx',
      '(main)/medical/page.jsx',
      '(main)/page.jsx',
      'contact-us/page.jsx',
    ].sort(),
  )
})

test('ProductStory retains one server-rendered media hook and no trapping scroll container', () => {
  const story = readFileSync(
    new URL('../src/components/home/ProductStory.jsx', import.meta.url),
    'utf8',
  )
  assert.doesNotMatch(
    story,
    /['"]use client['"]|IntersectionObserver|addEventListener/,
  )
  assert.equal((story.match(/data-stage-media/g) || []).length, 1)
  assert.match(story, /<section[\s\S]*?className="overflow-clip/)
  assert.doesNotMatch(sheet, /product-stage-settle/)
})

// Pass 2 increases travel, not JS or reduced-motion exposure.
test('motion uses no observer/scroll listener and keeps product/evidence server-rendered', () => {
  for (const file of ['ProductStory', 'VerticalSection', 'OperationalProof', 'HeroNetwork', 'TrustAndAccountability']) {
    const source = readFileSync(new URL(`../src/components/home/${file}.jsx`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /^['"]use client['"]/m)
    assert.doesNotMatch(source, /new IntersectionObserver|addEventListener\(\s*['"]scroll['"]|requestAnimationFrame\(/)
  }
  const proof = readFileSync(new URL('../src/components/home/OperationalProof.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(proof, /useState\(|useEffect\(|setInterval\(|setTimeout\(/)
  assert.match(proof, /\{metric\.value\}/)
})

test('operational route trees never opt in to marketing entrances', () => {
  const app = fileURLToPath(new URL('../src/app/', import.meta.url))
  function inspect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) inspect(path)
      else if (entry.name.endsWith('.jsx')) {
        const route = relative(app, path).replaceAll('\\', '/')
        if (/(^|\/)(send|track|track-partner|pay|payment|request)(\/|$)/.test(route)) {
          assert.doesNotMatch(readFileSync(path, 'utf8'), /data-motion|data-marketing-motion/, route)
        }
      }
    }
  }
  inspect(app)
})

test('hover elevation is explicit, fine-pointer only and excludes disabled controls', () => {
  motion.walkRules((rule) => {
    if (!rule.selector.includes(':hover') || rule.selector.includes('data-motion-hover')) return
    assert.match(rule.selector, /\[data-motion-control\]/)
    assert.match(rule.selector, /:not\(:disabled\)/)
    assert.match(rule.selector, /:not\(:focus-visible\)/)
    assert.ok(guarded(rule, 'media', 'pointer: fine'))
    assert.ok(guarded(rule, 'media', 'prefers-reduced-motion: no-preference'))
  })
})

test('first hero demonstration is in server HTML with no startup waiting period', () => {
  const hero = readFileSync(new URL('../src/components/home/RecentRequestFlashcards.jsx', import.meta.url), 'utf8')
  assert.match(hero, /\[phase, setPhase\] = useState\('in'\)/)
  assert.doesNotMatch(hero, /INITIAL_DELAY_MS|firstIdleRef/)
})

// Explicit dependency freeze for the contained motion task. A future authorized
// dependency change must intentionally update this baseline, never slip through.
test('motion work does not alter the dependency manifest or lockfile', () => {
  const expected = {"package.json": "8c12ef66203511bb57ee2c67f12e4d390d1d48593bbf5e8ea2f58584b7e22b75", "package-lock.json": "795ec88d720294b22b1253858ff81bafe5b982237cb1977c43e4946d775ee1fa"}
  for (const [file, hash] of Object.entries(expected)) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n')
    assert.equal(createHash('sha256').update(source).digest('hex'), hash, file)
  }
})

test('presentational hover is explicit, CSS-only, fine-pointer and reduced-motion gated', () => {
  let count = 0
  motion.walkRules((rule) => {
    if (!rule.selector.includes('data-motion-hover')) return
    count++
    assert.ok(guarded(rule, 'media', 'pointer: fine'))
    assert.ok(guarded(rule, 'media', 'hover: hover'))
    assert.ok(guarded(rule, 'media', 'prefers-reduced-motion: no-preference'))
    for (const selector of rule.selectors) assert.ok(selector.startsWith('[data-marketing-motion]'))
    assert.doesNotMatch(rule.selector, /\b(input|button|form|a)\b|:focus-visible/)
    if (rule.selector.includes(':hover')) assert.match(rule.selector, /:not\(:focus-within\)/)
    rule.walkDecls((decl) => assert.ok(['transition-property', 'transition-duration', 'transition-timing-function', 'translate', 'rotate', 'box-shadow'].includes(decl.prop)))
  })
  assert.ok(count >= 7)
  for (const [file, hooks] of Object.entries({
    'home/ProductStory': ['stage', 'stage-media', 'stage-copy'],
    'home/VerticalSection': ['scene', 'media-left', 'card-right'],
    'home/WhyBrand': ['card'],
    'ServicePanels': ['card'],
  })) {
    const source = readFileSync(new URL(`../src/components/${file}.jsx`, import.meta.url), 'utf8')
    for (const hook of hooks) assert.ok(source.includes(`data-motion-hover="${hook}"`))
    assert.doesNotMatch(source, /onMouseEnter|onMouseLeave|onPointerEnter|IntersectionObserver|addEventListener|cursor-pointer|tabIndex=/)
  }
})
