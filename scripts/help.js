const path = require('path')
const { shell } = require('electron')
const editor = require('./editor')
const parser = require('./parser')
const { HELPDIR, hash } = require('./utils')

const doc = document.querySelector('#help #doc')
const backButton = document.querySelector('#help button#back')
const forwardButton = document.querySelector('#help button#forward')
const cache = {}
let history = {}

function go (url) {
  if (url.match(/^https?:/)) return shell.openExternal(href)
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
  doc.innerHTML = 'Loading...'
  let html = cache[url]
  if (html) {
    doc.innerHTML = html
    const snippets = doc.querySelectorAll('#help #doc textarea')
    snippets.forEach(editor.setup)
    return scroll(anchor)
  }
  try {
    const filePath = path.resolve(HELPDIR, `${file}.schelp`)
    const response = await window.fetch(filePath)
    const text = await response.text()
    html = parser.parse(text, url)
  } catch (error) {
    html = error
  }
  doc.innerHTML = cache[url] = html
  const snippets = doc.querySelectorAll('#help #doc textarea')
  snippets.forEach(editor.setup)
  scroll(anchor)
}

function scroll (anchor) {
  const id = anchor ? hash(anchor.replace(/^[.\-*]/, '')) : 'doc'
  const el = document.getElementById(id)
  el.scrollIntoView()
}

exports.go = go
exports.back = back
exports.forward = forward
exports.lookup = lookup
