import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import postcss from 'postcss'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const css = postcss.parse(read('src/styles/route-motion.css'))
test('route motion is CSS-only, reduced-motion opt-in and never hides content', () => {
  css.walkRules(rule => {
    let guarded = false
    for (let p = rule.parent; p; p = p.parent) {
      if (p.type === 'atrule' && p.name === 'media' && p.params === '(prefers-reduced-motion: no-preference)') guarded = true
    }
    assert.ok(guarded)
    if (rule.parent.name !== 'keyframes') {
      for (const selector of rule.selectors) assert.ok(selector.startsWith('[data-marketing-motion]'))
      assert.doesNotMatch(rule.selector, /header|footer|input|button|form|data-review|data-partner/)
    }
  })
  css.walkAtRules('keyframes', frames => {
    frames.walkDecls(decl => {
      assert.ok(['transform', 'opacity'].includes(decl.prop))
      if (decl.prop === 'opacity') assert.equal(frames.params, 'marketing-route-accent')
    })
  })
  css.walkDecls(decl => {
    assert.ok(!['display','visibility','animation-delay','scroll-behavior','will-change'].includes(decl.prop))
    if (decl.prop === 'opacity' && decl.parent.parent.name !== 'keyframes') assert.match(decl.parent.selector, /::after/)
  })
})

test('only four marketing pages and the contact intro opt into route motion', () => {
  const root = fileURLToPath(new URL('../src/app/', import.meta.url))
  const opted = []
  function visit(dir) {
    for (const entry of readdirSync(dir, {withFileTypes:true})) {
      const path = join(dir,entry.name)
      if (entry.isDirectory()) visit(path)
      else if (entry.name.endsWith('.jsx') && readFileSync(path,'utf8').includes('data-route-motion=')) opted.push(relative(root,path).replaceAll('\\','/'))
    }
  }
  visit(root)
  assert.deepEqual(opted.sort(), ['(main)/page.jsx','(main)/medical/page.jsx','(main)/legal/page.jsx','(main)/drop-batch/page.jsx','contact-us/page.jsx'].sort())
  const contact = read('src/app/contact-us/page.jsx')
  assert.equal((contact.match(/data-route-motion=/g)||[]).length,1)
  assert.match(contact, /data-route-motion="intro" className="lg:col-span-5"/)
  assert.doesNotMatch(contact, /<form[^>]*data-route-motion/)
})

test('server template leaves navigation, links, forms, focus and scroll to Next', () => {
  const template = read('src/app/(main)/template.jsx')
  assert.match(template, /return children/)
  assert.doesNotMatch(template, /use client|useEffect|useRouter|onClick|onSubmit|preventDefault|startViewTransition|addEventListener|setTimeout|scrollTo|\.focus\(/)
  assert.doesNotMatch(read('src/components/Header.jsx') + read('src/components/HeaderMobileNav.jsx'), /startViewTransition|preventDefault|data-route-motion/)
  assert.ok(read('src/app/layout.jsx').includes("import '@/styles/route-motion.css'"))
})
