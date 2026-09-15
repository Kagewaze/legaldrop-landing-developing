import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import postcss from 'postcss'
import { createMarketingNavigation, eligibleMarketingHref, MARKETING_ROUTES } from '../src/components/marketing-navigation.mjs'

const location = { href: 'https://druppr.ca/medical', origin: 'https://druppr.ca' }
const event = { button: 0 }
const anchor = (href, attrs = {}) => ({ target: attrs.target, getAttribute: () => href, hasAttribute: name => name in attrs })
const eligible = (href, click = event, attrs = {}, current = '/medical') => eligibleMarketingHref(click, anchor(href, attrs), current, location)
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const deferred = () => { let resolve, reject; const promise = new Promise((yes,no) => {resolve=yes;reject=no}); return {promise,resolve,reject} }
const tick = () => new Promise(resolve => setImmediate(resolve))

function harness({ reduced = false, absent = false, throws = false, observeThrows = false } = {}) {
  const pushes = [], attributes = new Map(), surfaces = new Map(), transitions = []
  let observer = null, disconnected = 0
  const doc = {
    documentElement: { setAttribute: (k,v) => attributes.set(k,v), removeAttribute: k => attributes.delete(k) },
    querySelector: selector => surfaces.get(selector.match(/="(.*?)"/)[1]),
  }
  if (!absent) doc.startViewTransition = callback => {
    if (throws) throw Error('API failure')
    const ready = deferred(), finished = deferred()
    const updateCallbackDone = Promise.resolve().then(callback)
    updateCallbackDone.then(ready.resolve, ready.reject)
    const transition = { ready: ready.promise, finished: finished.promise, updateCallbackDone, skipped: false, skipTransition() { this.skipped=true }, finish: finished.resolve, fail: ready.reject }
    transitions.push(transition)
    return transition
  }
  const controller = createMarketingNavigation({doc, push: href => pushes.push(href), reduced: () => reduced,
    observe: cb => { if(observeThrows)throw Error('observer setup failed');observer=cb;return()=>{observer=null;disconnected++} },
  })
  controller.commit('/medical')
  function mount(path) {
    const attrs = new Map()
    surfaces.set(path,{setAttribute:(k,v)=>attrs.set(k,v)})
    observer?.()
    return attrs
  }
  return { controller, pushes, attributes, transitions, mount, get disconnected(){return disconnected} }
}

test('native route allowlist excludes all operational destinations and origins', () => {
  assert.deepEqual(MARKETING_ROUTES, ['/', '/medical', '/legal', '/drop-batch', '/contact-us'])
  for (const route of MARKETING_ROUTES.filter(r=>r!=='/medical')) assert.equal(eligible(route),route)
  for (const route of ['/send','/send/pay','/track','/track/ABC','/track-partner/ABC','/pay/1/payment/2','/payment/success','/drop-batch/request','/privacy-policy']) {
    assert.equal(eligible(route),null)
    assert.equal(eligible('/legal',event,{},route),null)
  }
})

test('link adapter preserves external, special, modified and same-page activations', () => {
  for (const href of ['https://other.test/legal','//other.test/legal','mailto:hi@druppr.ca','tel:123','#record','/medical#record','/legal#record','/legal?source=nav','/medical','javascript:void(0)','http://[invalid']) assert.equal(eligible(href),null,href)
  for (const key of ['metaKey','ctrlKey','shiftKey','altKey','defaultPrevented']) assert.equal(eligible('/legal',{...event,[key]:true}),null,key)
  for (const button of [1,2]) assert.equal(eligible('/legal',{button}),null)
  for (const attrs of [{target:'_blank'},{target:'named-window'},{download:''}]) assert.equal(eligible('/legal',event,attrs),null)
  assert.equal(eligible('/legal',event,{target:'_self'}),'/legal')
})

test('absent API, reduced motion and setup failures leave original Link navigation available', () => {
  for (const options of [{absent:true},{reduced:true},{throws:true},{observeThrows:true}]) {
    const h=harness(options)
    assert.equal(h.controller.navigate('/legal'),false)
    assert.deepEqual(h.pushes,[])
    assert.equal(h.attributes.has('data-druppr-vt'),false)
  }
})

test('native update waits for BOTH pathname commit and destination DOM, not elapsed frames', async () => {
  const h=harness()
  assert.equal(h.controller.navigate('/legal'),true)
  await tick()
  assert.deepEqual(h.pushes,['/legal'])
  let done=false
  h.transitions[0].updateCallbackDone.then(()=>{done=true})
  h.controller.commit('/legal')
  await tick()
  assert.equal(done,false,'pathname cannot release a snapshot of missing streamed content')
  const attrs=h.mount('/legal')
  await tick()
  assert.equal(done,true)
  assert.equal(attrs.has('data-native-arrived'),true)
  assert.ok(h.disconnected>0)
  h.transitions[0].finish()
  await tick()
  assert.equal(h.attributes.has('data-druppr-vt'),false)
  assert.equal(attrs.has('data-native-arrived'),true,'fallback suppression survives native cleanup')
})

test('destination DOM without committed pathname cannot release transition', async () => {
  const h=harness();h.controller.navigate('/legal');await tick()
  let done=false;h.transitions[0].updateCallbackDone.then(()=>{done=true})
  h.mount('/legal');await tick();assert.equal(done,false)
  h.controller.commit('/legal');await tick();assert.equal(done,true)
  h.controller.cancel()
})

test('snapshot failure releases a pending route without a duplicate push', async () => {
  const h=harness();h.controller.navigate('/legal');await tick()
  h.transitions[0].fail(Error('snapshot unavailable'));await tick()
  assert.deepEqual(h.pushes,['/legal'])
  assert.equal(h.attributes.has('data-druppr-vt'),false)
  assert.equal(h.transitions[0].skipped,true)
  await h.transitions[0].updateCallbackDone
})

test('superseded callbacks never navigate to stale destinations', async () => {
  const h=harness();h.controller.navigate('/legal');h.controller.navigate('/contact-us');await tick()
  assert.deepEqual(h.pushes,['/contact-us'])
  h.controller.commit('/contact-us');h.mount('/contact-us');await tick()
  h.transitions[1].finish();await tick()
})

test('unexpected route commits and unmount cancel coordination without owning history', async () => {
  const h=harness();h.controller.navigate('/legal');await tick();h.controller.commit('/send')
  assert.equal(h.attributes.has('data-druppr-vt'),false)
  assert.equal(h.transitions[0].skipped,true)
  assert.deepEqual(h.pushes,['/legal'])
  await h.transitions[0].updateCallbackDone
})

test('coordinator is explicit, bounded and leaves forms, scroll and browser history untouched', () => {
  const coordinator=read('src/components/MarketingNavigation.jsx')
  const controller=read('src/components/marketing-navigation.mjs')
  assert.match(coordinator,/useLayoutEffect/)
  assert.match(coordinator,/commit\(pathname\)/)
  assert.match(controller,/data-marketing-route/)
  assert.match(controller,/typeof doc.startViewTransition !== 'function'/)
  assert.match(coordinator,/prefers-reduced-motion: reduce/)
  assert.match(coordinator,/if \(href && coordinator.current.navigate\(href\)\) event.preventDefault\(\)/)
  assert.match(coordinator,/observer.disconnect\(\)/)
  assert.doesNotMatch(coordinator+controller,/addEventListener|IntersectionObserver|requestAnimationFrame|setTimeout|onSubmit|scrollTo|popstate|pushState|replaceState|querySelectorAll|document.onclick/)
})

test('native CSS only animates named marketing snapshots and never restarts fallback', () => {
  const css=postcss.parse(read('src/styles/native-route-motion.css'))
  css.walkRules(rule=>{
    let guarded=false
    for(let p=rule.parent;p;p=p.parent)if(p.name==='media'&&p.params==='(prefers-reduced-motion: no-preference)')guarded=true
    assert.ok(guarded)
    if(rule.parent.name!=='keyframes')assert.match(rule.selector,/data-druppr-vt|data-native-arrived/)
  })
  css.walkAtRules('keyframes',frames=>frames.walkDecls(d=>assert.ok(['transform','opacity'].includes(d.prop))))
  const text=css.toString()
  assert.match(text,/html\[data-druppr-vt\] \{ view-transition-name: none/)
  assert.match(text,/data-marketing-route\] \{[\s\S]*?view-transition-name: druppr-page/)
  assert.match(text,/data-native-arrived/)
  assert.doesNotMatch(text,/view-transition-(?:old|new)\(root\)/)
})
