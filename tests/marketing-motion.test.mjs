import assert from 'node:assert/strict'
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
      if (decl.prop === 'opacity') assert.ok(Number(decl.value) >= 0.94)
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
    if (decl.prop === 'opacity' || decl.prop === 'transform') {
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
