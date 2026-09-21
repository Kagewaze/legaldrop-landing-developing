import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import postcss from 'postcss'
import { parse } from 'espree'
import { BOOKING_ROUTES, bookingTransitionPlan, eligibleBookingHref, bookingSurfaceAvailable } from '../src/components/booking-navigation.mjs'
import { createMarketingNavigation, MARKETING_ROUTES } from '../src/components/marketing-navigation.mjs'

const read = p => readFileSync(new URL(`../${p}`,import.meta.url),'utf8').replaceAll('\r\n','\n')
const plan = (from,to) => bookingTransitionPlan(from,to,MARKETING_ROUTES)
const tick = () => new Promise(resolve=>setImmediate(resolve))
const location = {origin:'https://druppr.ca',href:'https://druppr.ca/send'}
function eligible(from,to,event={button:0},attrs={}) {
  return eligibleBookingHref(event,{target:attrs.target,hasAttribute:k=>k in attrs,getAttribute:()=>to},from,location,MARKETING_ROUTES)
}

test('booking direction follows actual send steps; standalone quote is not step four',()=>{
 assert.deepEqual(BOOKING_ROUTES,['/send','/send/details','/send/pay','/drop-batch/request'])
 assert.equal(plan('/send','/send/details').direction,'forward')
 assert.equal(plan('/send/details','/send/pay').direction,'forward')
 assert.equal(plan('/send/details','/send').direction,'back')
 assert.equal(plan('/send/pay','/send/details').direction,'back')
 assert.equal(plan('/drop-batch/request','/send').direction,'neutral')
 for(const route of MARKETING_ROUTES)assert.deepEqual(plan(route,'/send'),{direction:'forward',bridge:true})
 for(const path of ['/track/abc','/track-partner/abc','/pay/abc','/payment/success','/payment/cancelled','/send/unknown','/connect/onboarding/return']) {
  assert.equal(plan('/send',path),null);assert.equal(plan(path,'/send'),null)
 }
 assert.equal(plan('/send','/medical'),null)
})

test('booking links preserve modified/external/download/hash activations and payment priority',()=>{
 for(const key of ['ctrlKey','metaKey','shiftKey','altKey','defaultPrevented'])assert.equal(eligible('/send','/send/details',{button:0,[key]:true}),null)
 for(const button of [1,2])assert.equal(eligible('/send','/send/details',{button}),null)
 for(const attrs of [{target:'_blank'},{download:''},{target:'named-window'}])assert.equal(eligible('/send','/send/details',{button:0},attrs),null)
 for(const href of ['https://elsewhere.test/send/details','mailto:a@example.test','tel:123','#address','/send/details#heading','/send?section=legal_document','/send'])assert.equal(eligible('/send',href),null)
 assert.equal(eligible('/send/pay','/send/details'),null,'payment header exits stay immediate')
 assert.equal(eligible('/send/pay','/send/details',{button:0},{'data-booking-return':''}),'/send/details')
 assert.equal(eligible('/send','/send/details'),'/send/details')
})

test('open autocomplete lists and live Stripe prevent booking snapshot initialization',()=>{
 const doc={querySelectorAll:()=>[{getClientRects:()=>[{}]}],querySelector:()=>null}
 assert.equal(bookingSurfaceAvailable(doc,'/send'),false)
 doc.querySelectorAll=()=>[];doc.querySelector=()=>({})
 assert.equal(bookingSurfaceAvailable(doc,'/send/pay'),false)
 doc.querySelector=()=>null
 assert.equal(bookingSurfaceAvailable(doc,'/send/pay'),true)
})

function harness({reduce=false,absent=false,throwApi=false}={}) {
 const attributes=new Map(),pushes=[],markers=new Set()
 let callback,resolveFinished,check
 const doc={documentElement:{style:{setProperty:(k,v)=>attributes.set(k,v),removeProperty:k=>attributes.delete(k)},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k)},querySelectorAll:()=>[],querySelector:selector=>selector==='[data-booking-surface], [data-marketing-route]'?{}:markers.has(selector)?{setAttribute(){}}:null}
 if(!absent)doc.startViewTransition=fn=>{
  if(throwApi)throw Error('unsupported snapshot')
  callback=Promise.resolve().then(fn)
  return {ready:callback,updateCallbackDone:callback,finished:new Promise(resolve=>{resolveFinished=resolve}),skipTransition(){}}
 }
 const controller=createMarketingNavigation({doc,push:href=>pushes.push(href),observe:fn=>{check=fn;return()=>{}},reduced:()=>reduce})
 controller.commit('/send')
 return {controller,pushes,attributes,markers,check:()=>check(),done:()=>callback,finish:()=>resolveFinished()}
}

test('booking uses the existing commit coordinator with a distinct flag and DOM marker',async()=>{
 const h=harness();assert.equal(h.controller.navigate('/send/details',true),true);await tick()
 assert.deepEqual(h.pushes,['/send/details']);assert.equal(h.attributes.get('data-druppr-booking'),'forward');assert.equal(h.attributes.has('data-druppr-vt'),false);assert.equal(h.attributes.get('data-booking-in'),'/send/details')
 let done=false;h.done().then(()=>{done=true})
 h.controller.commit('/send/details');await tick();assert.equal(done,false)
 h.markers.add('[data-booking-route="/send/details"]');h.check();await tick();assert.equal(done,true)
 h.finish();await tick();assert.equal(h.attributes.has('data-druppr-booking'),false);assert.equal(h.attributes.has('data-booking-in'),false)
})

test('booking reduced motion and native setup failure return control to ordinary Next links',()=>{
 for(const options of [{reduce:true},{absent:true},{throwApi:true}]) {
  const h=harness(options);assert.equal(h.controller.navigate('/send/details',true),false)
  assert.deepEqual(h.pushes,[]);assert.equal(h.attributes.size,0)
 }
})

test('booking CSS moves only snapshots, progress fill and final-value quote labels',()=>{
 const css=postcss.parse(read('src/styles/booking-motion.css'))
 css.walkRules(rule=>{
  let gated=false;for(let p=rule.parent;p;p=p.parent)if(p.name==='media'&&p.params==='(prefers-reduced-motion: no-preference)')gated=true
  assert.ok(gated)
  if(rule.parent.name!=='keyframes')assert.doesNotMatch(rule.selector,/input|select|button|iframe|Stripe|map-marker|listbox/)
 })
 css.walkAtRules('keyframes',frames=>frames.walkDecls(d=>assert.ok(['opacity','transform'].includes(d.prop))))
 assert.match(css.toString(),/view-transition-name: druppr-booking/)
 assert.doesNotMatch(css.toString(),/druppr-page|animation-delay/)
 assert.match(read('src/components/send/StepChrome.jsx'),/scaleX\(\$\{step.index \/ TOTAL_STEPS\}/)
})

test('map and Stripe components are outside selected booking snapshot subtrees',()=>{
 for(const file of ['src/app/send/page.jsx','src/app/send/details/page.jsx','src/components/dropbatch/DropBatchRequestFlow.jsx','src/components/send/StepChrome.jsx']) {
  const ast=parse(read(file),{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}})
  function visit(node,inside=false) {
   if(!node||typeof node!=='object')return
   if(node.type==='JSXElement') {
    inside ||= node.openingElement.attributes.some(a=>a.name?.name==='data-booking-surface')
    if(inside)assert.ok(!['SendMap','Elements','PaymentForm','PaymentElement','iframe'].includes(node.openingElement.name.name),file)
   }
   for(const v of Object.values(node))if(Array.isArray(v))v.forEach(n=>visit(n,inside));else if(v&&typeof v==='object')visit(v,inside)
  }visit(ast)
 }
 assert.match(read('src/app/send/pay/template.jsx'),/data-booking-route="\/send\/pay"/)
 assert.doesNotMatch(read('src/app/send/pay/template.jsx'),/use client|import.*stripe|router|data-booking-surface=/)
})

const approvedHashes = {"package.json": "8c12ef66203511bb57ee2c67f12e4d390d1d48593bbf5e8ea2f58584b7e22b75", "package-lock.json": "795ec88d720294b22b1253858ff81bafe5b982237cb1977c43e4946d775ee1fa", "src/components/send/SendMap.jsx": "11eb6e2d40d5d51f2c443dacee299d063a18cc6a9fcb5ad0b11baf979d3aa377", "src/components/send/AddressAutocomplete.jsx": "0a88f4fd2c52afa0b00b3475ee4c4de29de71cccf8abe0d1d7066d213041fc2a", "src/components/send/MobileAddressField.jsx": "fd0ebb27008e89b3316c3c819fe854648d702352cf99b3fdfce6e24820cf64e2", "src/components/send/ContactFields.jsx": "cd84b7029294d297d2ad5166049cad7dacd348ae88d778c554c74baa8a62f69b", "src/components/send/PaymentForm.jsx": "3ff36a722e9de89c32e4fd113b5b082cce3928fe1f6933cede521cf5831885d6", "src/components/send/PickupTiming.jsx": "a4d769040008002017bc67efad1fc47c365b0080608ef4064d5c321c43d50430", "src/components/send/VehiclePicker.jsx": "49af7417c2a5455da8bd663eb1eff535dee3b5efb8f912cdfa94a071c2c12a31", "src/components/send/useVehicleQuotes.js": "07d3127caaf11d324b8e00d8811e1be2f8928fe683d06ac469105dc0a3866281", "src/components/send/useDropBatchQuote.js": "7741a61b565a485b90fe8c1b1b44822995f0ca14a45688feaa1a2f2c0b7c8217", "src/components/send/vehicles.js": "fa243901580f207b50784f76d125fe76107d088e583ea853ab149a6f03d49bdd", "src/components/send/buildOrderPayload.js": "460bc7645c8c947e21cd2e4a743bf4a4d3e464d0f4dddb387838818d00a49c07", "src/lib/config.js": "e256da6c8f51a0fd714eb17df457ee1eee935333adf84bfb786772ee0ec817c5", "src/styles/tailwind.css": "0cf90abec9bd957eeeaeace1dd1544cd385b0e009ba3ff051e7c92ebdd5d5443", "src/styles/route-motion.css": "a7c41cefd8433050bf542e21a21446747990db15bc00e2dbdddc18060587478f", "src/styles/native-route-motion.css": "aa2c409f811a43c9fc9b7d8face623574947c478b54abb7c225ce0979bd52aad", "src/lib/send-flow.js": "97710934e1b3607b36a052e91a50a99e0ae598809a8ea18c8e5e34410e61d060", "src/app/send/page.jsx": "304650e579674f3a94dac27e12fc4f9f61892a5d9a017da063d71bbb43ec335d", "src/app/send/details/page.jsx": "91a0d59c731f8b98ac57d184d4748c083ed8fe904b1cc29bba85e9bfc26df0c7", "src/app/send/pay/page.jsx": "65fbc9a241c49ef3d03dded1df681a3d731b1baebc90be58a7a0a711eb1fada5", "src/components/send/PriceBreakdown.jsx": "64c80aa11af6ceb0bf68ea436143770b3a3e8b307f1ae3a0efddcb1c2493851a", "src/components/send/DropBatchQuoteCard.jsx": "bd779ecdd53492280e51a84d8cc0ab2086b99735dafe5a0577c04cdf1a0d1d5f", "src/components/dropbatch/DropBatchRequestFlow.jsx": "f708ad0240f9ff5a93984a9093885507f49a8f22d380e92e211f16f1311bccc4", "src/components/send/StepChrome.jsx": "d3d87564d3f9ecab2c03996c4997f906c750e3b3a90a870fc74e94d8cc4d0234", "src/app/(main)/drop-batch/page.jsx": "cf775e116299849de97aa2f924ad981a6c8d25c54b88bf08f38a68ea20d33d33", "src/app/layout.jsx": "f8a471f44dc5b25d948b043f4803b5f66a0c5e9898c4c8c5d7654187e1731211"}
test('dependencies, marketing styling, forms, payment handlers, maps and calculation logic stay frozen',()=>{
 for(const [file,expected] of Object.entries(approvedHashes)) {
  let text=read(file)
  // Strip only the enumerated presentation/link additions; all original source
  // (including inline field handlers, validation and pricing) must still match.
  text=text.replace("import { MarketingLink as Link } from '@/components/MarketingNavigation'","import Link from 'next/link'")
  text=text.replaceAll(/data-booking-route="[^"]+" /g,'').replaceAll('data-booking-surface ','').replaceAll('data-booking-return ','')
  text=text.replace('data-booking-price key={total} ','').replace('data-booking-price key={result.senderPays} ','').replace("data-booking-price={eligible ? '' : undefined} key={senderPays} ",'')
  if(file==='src/components/send/StepChrome.jsx') {
   text=text.replace("      data-booking-surface={pathname === '/send/pay' ? '' : undefined}\n",'').replace('className="relative mb-3.5','className="mb-3.5')
   text=text.replace(/      <span aria-hidden="true" className="pointer-events-none[\s\S]*?      <\/span>\n/,'')
  }
  if(file==='src/app/layout.jsx')text=text.replace("import '@/styles/booking-motion.css'\n",'')
  // The approved marketing pages already used MarketingLink before this pass.
  if(file==='src/app/layout.jsx')text=read(file).replace("import '@/styles/booking-motion.css'\n",'')
  assert.equal(createHash('sha256').update(text).digest('hex'),expected,file)
 }
})

test('workflow snapshots are distinct, clipped and independently based without repositioning',()=>{
 const text=read('src/styles/booking-motion.css'),css=postcss.parse(text),names=[]
 css.walkDecls('view-transition-name',d=>{if(d.value!=='none')names.push(d.value)})
 assert.deepEqual(names,['addresses','details','payment','dropbatch','marketing'].map(n=>`druppr-booking-${n}`))
 assert.doesNotMatch(text,/view-transition-name: druppr-booking;|\(druppr-booking\)/)
 for(const [route,name] of [['/send','addresses'],['/send/details','details'],['/send/pay','payment'],['/drop-batch/request','dropbatch']]) {
  let base=false
  css.walkRules(rule=>{if(rule.selector===`html[data-druppr-booking][data-booking-in="${route}"]::view-transition-group(druppr-booking-${name})`) {
   assert.ok(rule.nodes.some(d=>d.prop==='z-index'&&d.value==='2'))
   assert.ok(rule.nodes.some(d=>d.prop==='background'&&['#fff','#f6f4f8','#fbf9fc'].includes(d.value)));base=true
  }})
  assert.ok(base,route)
 }
 for(const name of names)for(const pseudo of ['group','image-pair']) {
  let clipped=false
  css.walkRules(rule=>{if(rule.selector.includes(`::view-transition-${pseudo}(${name})`)&&rule.nodes.some(d=>d.prop==='overflow'&&d.value==='clip'))clipped=true})
  assert.ok(clipped,`${name} ${pseudo}`)
 }
 for(const file of ['src/components/booking-navigation.mjs','src/components/marketing-navigation.mjs','src/styles/booking-motion.css'])assert.doesNotMatch(read(file),/bookingSurfaceRect|positionBookingSnapshot|clearBookingSnapshot|--booking-old-|getBoundingClientRect/)
})

test('old snapshots vanish; incoming snapshots stay solid; progress and price remain approved',()=>{
 const css=read('src/styles/booking-motion.css')
 assert.match(css,/booking-step-out 280ms cubic-bezier\(0\.4, 0, 0\.2, 1\) both/)
 assert.match(css,/booking-step-in 420ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
 assert.match(css,/55% \{ opacity: 0\.7; transform: translateX\(calc\(-10px/)
 assert.match(css,/100% \{ opacity: 0; transform: translateX\(calc\(-16px/)
 assert.match(css,/0% \{ opacity: 0\.88; transform: translate\(calc\(24px/)
 assert.match(css,/40% \{ opacity: 0\.97; transform: translate\(calc\(8px/)
 assert.match(css,/--booking-direction: -1/)
 assert.match(css,/--booking-direction: 0; --booking-enter-y: 8px; --booking-enter-mid-y: 3px; animation-duration: 340ms/)
 assert.match(css,/transition: transform 380ms cubic-bezier\(0\.22, 1, 0\.36, 1\)/)
 assert.match(css,/opacity: 0\.8; transform: translateY\(4px\)/)
 assert.match(css,/booking-price-state 220ms ease-out/)
 assert.match(read('src/components/send/StepChrome.jsx'),/h-\[3px\]/)
})
