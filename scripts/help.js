const path = require('path')
const { HELPDIR, hash } = require('./utils')
const { init } = require('./editor')
const schelp = require('./parser')

const docs = document.querySelector('#docs')
const backButton = document.querySelector('#browser #back')
const forwardButton = document.querySelector('#browser #forward')
const cache = {}
let history = {}

function go (url) {
  const newHistory = { prev: history, url }
  history.next = newHistory
  history = newHistory
  load(history.url)
  backButton.toggleAttribute('disabled', !history.prev.url)
  forwardButton.toggleAttribute('disabled', !history.next)
}

function back () {
  history = history.prev
  load(history.url)
  backButton.toggleAttribute('disabled', !history.prev.url)
  forwardButton.toggleAttribute('disabled', !history.next.url)
}

function forward () {
  history = history.next
  load(history.url)
  backButton.toggleAttribute('disabled', !history.prev.url)
  forwardButton.toggleAttribute('disabled', !history.next)
}

function lookup (name) {
  const clazz = name.replace(/./, c => c.toUpperCase())
  go(`Classes/${clazz}`)
}

async function load (url) {
  const [file, anchor] = url.split('#')
  if (!file && anchor) return scroll(anchor)
  docs.innerHTML = 'Loading...'
  let html = cache[url]
  if (html) {
    docs.innerHTML = html
    const snippets = document.querySelectorAll('#docs textarea')
    snippets.forEach(init)
    return scroll(anchor)
  }
  try {
    const filePath = path.resolve(HELPDIR, `${file}.schelp`)
    const response = await fetch(filePath)
    const text = await response.text()
    html = schelp.parse(text, url)
  } catch (error) {
    html = error
  }
  docs.innerHTML = cache[url] = html
  const snippets = document.querySelectorAll('#docs textarea')
  snippets.forEach(init)
  scroll(anchor)
}

function scroll (anchor) {
  const id = anchor && hash(anchor.replace(/^[.\-*]/, '')) || 'docs'
  const el = document.getElementById(id)
  el.scrollIntoView()
}

exports.go = go
exports.back = back
exports.forward = forward
exports.lookup = lookup
