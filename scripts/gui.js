const fs = require('fs')
const menu = require('./menu')
const lang = require('./lang')
const editor = require('./editor')
const { APPSUPPORT_DIR } = require('./utils')

const leftPane = document.querySelector('#left')
const rightPane = document.querySelector('#right')
const loading = document.querySelector('#loading')
const helpPane = document.querySelector('#help')
const postPane = document.querySelector('#post')
const iframe = helpPane.querySelector('iframe')
const output = document.querySelector('#post output')
let mainEditor

async function start () {
  lang.boot()
  iframe.addEventListener('load', onDocsLoad)
  iframe.src = `file://${APPSUPPORT_DIR.replace(' ', '%20')}/Help.html`
  document.body.classList.toggle('dark-mode', window.localStorage.getItem('dark-mode') === 'true')
  mainEditor = editor.attach(leftPane.querySelector('textarea'))
  mainEditor.focus()
  menu.setup()
  window.addEventListener('mousedown', onMousedown)
  document.addEventListener('click', onClick)
}

function onDocsLoad () {
  const win = iframe.contentWindow
  const doc = iframe.contentDocument
  const anchor = win.location.hash.replace('#', '')
  const isDarkMode = window.localStorage.getItem('dark-mode') === 'true'

  doc.documentElement.classList.toggle('dark-mode', isDarkMode)

  // remove styles, scripts and code blocks
  doc.querySelectorAll('.CodeMirror').forEach((el) => el.remove())
  doc.head.querySelectorAll('link').forEach((link) => {
    const file = link.getAttribute('href').split('/').pop()
    if (['codemirror.css', 'editor.css'].includes(file)) link.remove()
  })
  doc.head.querySelectorAll('script').forEach((script) => {
    const file = (script.getAttribute('src') || '').split('/').pop()
    if (file.match(/^(codemirror|editor)/)) script.remove()
  })

  // inject own stylesheet
  const styles = document.createElement('link')
  styles.rel = 'stylesheet'
  styles.href = `${__dirname}/../styles/help.css`
  doc.head.appendChild(styles)

  // setup code blocks
  doc.querySelectorAll('textarea').forEach(editor.attach)

  // make docmap avalable
  eval(fs.readFileSync(`${APPSUPPORT_DIR}/docmap.js`, 'utf-8'))

  // fix menubar linx
  doc.querySelectorAll('.menu-link.home').forEach((home) => {
    home.textContent = 'Home'
  })
  const dropdowns = doc.querySelectorAll('.menu-link[href="#"]')
  dropdowns.forEach((dropdown) => {
    dropdown.textContent = dropdown.textContent.replace('▼', '')
  })

  doc.querySelectorAll('#folder').forEach((folder) => {
    if (folder.nextSibling) {
      folder.nextSibling.textContent = ' > '
    }
  })

  // move subheader to bottom related
  doc.querySelectorAll('.doclink').forEach((el) => el.remove())
  const subheader = doc.querySelector('.subheader')
  if (subheader && subheader.children.length) {
    const contents = doc.querySelector('.contents')
    const h2 = doc.createElement('h2')
    subheader.remove()
    h2.textContent = 'Related'
    contents.appendChild(h2)
    contents.appendChild(subheader)
  }

  // move superclasses to bottom related
  doc.querySelectorAll('#superclasses').forEach((superclasses) => {
    superclasses.remove()
    superclasses.innerHTML = 'Superclasses: ' + superclasses.innerHTML
    subheader.appendChild(superclasses)
  })

  // toggle loading
  setTimeout(() => loading.setAttribute('hidden', ''), 50)
  win.addEventListener('unload', () => {
    doc.querySelectorAll('.CodeMirror').forEach((el) => el.remove())
    loading.removeAttribute('hidden')
  })

  // render docs before navigating to them
  doc.addEventListener('click', async (event) => {
    if (event.target.tagName === 'A' && event.target.closest('.contents')) {
      const href = event.target.href.split('#')[0]
      if (href.match(/^file:.+\.html$/)) {
        event.preventDefault()
        await lang.evaluate(`SCDoc.prepareHelpForURL(URI("${event.target.href}"))`, true)
        iframe.src = event.target.href
      }
    }
  })

  // make codemirror adjust itself
  win.dispatchEvent(new window.Event('resize'))

  // scroll anchor into view
  setTimeout(() => {
    doc.querySelectorAll(`[name="${anchor}"]`).forEach((el) => el.scrollIntoView())
  }, 50)
}

function onMousedown (event) {
  if (event.target !== leftPane && event.target !== helpPane) return
  event.preventDefault()
  const body = document.body
  const targetPane = event.target
  const isColumn = targetPane === leftPane
  const total = isColumn ? body.offsetWidth : body.offsetHeight
  const flexGrow = 2 / total
  function resize (event) {
    const increase = flexGrow * (isColumn ? event.clientX : event.clientY)
    const decrease = total * flexGrow - increase
    const oppsitePane = isColumn ? rightPane : postPane
    targetPane.style.flexGrow = increase
    oppsitePane.style.flexGrow = decrease
  }
  iframe.style.pointerEvents = 'none'
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', () => {
    mainEditor.refresh()
    iframe.style.pointerEvents = 'auto'
    window.removeEventListener('mousemove', resize)
  })
}

function onClick (event) {
  const target = event.target
  if (target.tagName === 'BUTTON') {
    if (target.id === 'refresh') {
      iframe.contentWindow.location.reload(true)
    } else if (target.id === 'back') {
      iframe.contentWindow.history.back()
    } else if (target.id === 'forward') {
      iframe.contentWindow.history.forward()
    }
  }
}

function post (message, type = 'value') {
  const lines = output.querySelector('ul')
  const line = document.createElement('li')
  line.classList.add(type)
  line.innerHTML = `<pre>${message}</pre>`
  lines.appendChild(line)
  line.scrollIntoView()
}

exports.start = start
exports.post = post
