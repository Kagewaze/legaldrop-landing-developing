// Adopted, test-only, from the fresh-context D7c review (review-evidence/d7c-final-independent-review/runtime/dom-shim.mjs).
// Minimal DOM, just enough for the real react-dom 18.2 client renderer to mount, update and
// unmount host components. No layout, no events dispatch (tests invoke React's own props),
// no network. Written for this review only; it is not a general DOM.

class Node {
  constructor(nodeType, nodeName, ownerDocument) {
    this.nodeType = nodeType
    this.nodeName = nodeName
    this.ownerDocument = ownerDocument
    this.parentNode = null
    this.childNodes = []
  }
  get firstChild() { return this.childNodes[0] ?? null }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null }
  get nextSibling() {
    const p = this.parentNode
    if (!p) return null
    return p.childNodes[p.childNodes.indexOf(this) + 1] ?? null
  }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null }
  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child)
    child.parentNode = this
    this.childNodes.push(child)
    return child
  }
  insertBefore(child, ref) {
    if (!ref) return this.appendChild(child)
    if (child.parentNode) child.parentNode.removeChild(child)
    const i = this.childNodes.indexOf(ref)
    if (i < 0) throw new Error('insertBefore: reference is not a child')
    child.parentNode = this
    this.childNodes.splice(i, 0, child)
    return child
  }
  removeChild(child) {
    const i = this.childNodes.indexOf(child)
    if (i < 0) throw new Error('removeChild: not a child')
    this.childNodes.splice(i, 1)
    child.parentNode = null
    return child
  }
  contains(node) {
    while (node) { if (node === this) return true; node = node.parentNode }
    return false
  }
  get textContent() {
    if (this.nodeType === 3 || this.nodeType === 8) return this.nodeValue
    return this.childNodes.map((c) => (c.nodeType === 8 ? '' : c.textContent)).join('')
  }
  set textContent(value) {
    for (const c of this.childNodes) c.parentNode = null
    this.childNodes = []
    if (value !== '' && value !== null && value !== undefined) {
      this.appendChild(this.ownerDocument.createTextNode(String(value)))
    }
  }
  addEventListener() {}
  removeEventListener() {}
}

class Text extends Node {
  constructor(doc, value) { super(3, '#text', doc); this.nodeValue = String(value) }
  get data() { return this.nodeValue }
  set data(v) { this.nodeValue = String(v) }
}

class Comment extends Node {
  constructor(doc, value) { super(8, '#comment', doc); this.nodeValue = String(value) }
}

class Style {
  setProperty(k, v) { this[k] = v }
  removeProperty(k) { delete this[k] }
}

class Element extends Node {
  constructor(doc, tag, ns = 'http://www.w3.org/1999/xhtml') {
    super(1, String(tag).toUpperCase(), doc)
    this.tagName = String(tag).toUpperCase()
    this.localName = String(tag).toLowerCase()
    this.namespaceURI = ns
    this._attrs = new Map()
    this.style = new Style()
  }
  setAttribute(n, v) { this._attrs.set(n, String(v)) }
  setAttributeNS(_ns, n, v) { this.setAttribute(n, v) }
  getAttribute(n) { return this._attrs.has(n) ? this._attrs.get(n) : null }
  hasAttribute(n) { return this._attrs.has(n) }
  removeAttribute(n) { this._attrs.delete(n) }
  removeAttributeNS(_ns, n) { this.removeAttribute(n) }
  get innerHTML() { return this.textContent }
  set innerHTML(v) { this.textContent = v }
  focus() {}
  blur() {}
}

class Document extends Node {
  constructor() {
    super(9, '#document', null)
    this.documentElement = new Element(this, 'html')
    this.body = new Element(this, 'body')
    this.documentElement.appendChild(this.body)
    this.appendChild(this.documentElement)
    this.activeElement = this.body
  }
  createElement(tag) { return new Element(this, tag) }
  createElementNS(ns, tag) { return new Element(this, tag, ns) }
  createTextNode(v) { return new Text(this, v) }
  createComment(v) { return new Comment(this, v) }
}

export function installDom() {
  const document = new Document()
  const location = {
    origin: 'http://localhost:3999',
    protocol: 'http:',
    search: '',
    href: 'http://localhost:3999/send/pay',
    reloads: 0,
    reload() { this.reloads += 1 },
  }
  const win = {
    document,
    location,
    HTMLIFrameElement: class HTMLIFrameElement {},
    addEventListener() {},
    removeEventListener() {},
    event: undefined,
  }
  win.top = win
  win.self = win
  globalThis.window = win
  globalThis.document = document
  return { document, window: win }
}

// Read-only helpers over the rendered tree.
export function all(node, pred, out = []) {
  if (!node) return out
  if (pred(node)) out.push(node)
  for (const c of node.childNodes ?? []) all(c, pred, out)
  return out
}

export function reactProps(el) {
  const key = Object.keys(el).find((k) => k.startsWith('__reactProps$'))
  return key ? el[key] : null
}
