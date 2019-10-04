const fs = require('fs')
const { sclang } = require('electron').remote.require('./main')
const { APPSUPPORT_DIR } = require('./scripts/utils')
const editor = require('./scripts/editor')

const leftPane = document.querySelector('#left')
const rightPane = document.querySelector('#right')
const loading = document.querySelector('#loading')
const helpPane = document.querySelector('#help')
const postPane = document.querySelector('#post')
const iframe = helpPane.querySelector('iframe')
const docmapCode = fs.readFileSync(`${APPSUPPORT_DIR.replace('%20', ' ')}/docmap.js`, 'utf-8')
const mainTextArea = leftPane.querySelector('textarea')
const mainEditor = editor.attach(mainTextArea)
mainEditor.focus()

window.addEventListener('mousedown', onMousedown)
window.addEventListener('resize', onResize)
document.addEventListener('keydown', onKeydown)
document.addEventListener('click', onClick)
iframe.addEventListener('load', onLoad)
iframe.src = `file://${APPSUPPORT_DIR}/Help.html`


function onLoad () {
  const win = iframe.contentWindow
  const doc = iframe.contentDocument


  // make docmap avalable
  eval(docmapCode)

  // fix menubar dropdown linx
  const dropdowns = doc.querySelectorAll('.menu-link[href="#"]')
  dropdowns.forEach((dropdown) => dropdown.textContent = dropdown.textContent.replace('▼', ''))

  doc.querySelectorAll('#folder').forEach((folder) => folder.nextSibling ? folder.nextSibling.textContent = ' > ' : '')

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
  const superclasses = doc.querySelector('#superclasses')
  if (superclasses) {
    superclasses.remove()
    superclasses.innerHTML = 'Superclasses: ' + superclasses.innerHTML
    subheader.appendChild(superclasses)
  }

  // setup code blocks. TODO remove styles when in Guides/../..
  doc.head.querySelectorAll('link[href="./../codemirror.css"]').forEach((el) => el.remove())
  doc.head.querySelectorAll('link[href="./../editor.css"]').forEach((el) => el.remove())
  doc.querySelectorAll('.CodeMirror').forEach((el) => el.remove())
  doc.querySelectorAll('textarea').forEach(editor.attach)

  // ovewrite stylesheet
  const styles = document.createElement('link')
  styles.rel = 'stylesheet'
  styles.href = `${__dirname}/styles/help.css`
  doc.head.appendChild(styles)

  // toggle loading
  setTimeout(() => loading.setAttribute('hidden', ''), 50)
  win.addEventListener('unload', () => loading.removeAttribute('hidden'))

  doc.addEventListener('keydown', onKeydown)
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
    iframe.style.pointerEvents = 'auto'
    window.removeEventListener('mousemove', resize)
  })
}

function onKeydown (event) {
  if (event.metaKey && event.key === 'q') {
    if (!window.confirm('Are you sure?')) {
      event.preventDefault()
    }
  }
  if (event.metaKey && event.key === 'b') sclang.interpret('s.boot')
  if (event.metaKey && event.shiftKey && event.key === 's') sclang.interpret('s.scope')
  if (event.metaKey && event.shiftKey && event.key === 'm') sclang.interpret('s.meter')
  if (event.metaKey && event.key === 'o') {
    helpPane.toggleAttribute('hidden')
    rightPane.toggleAttribute('hidden', helpPane.hidden && postPane.hidden)
    postPane.classList.toggle('pane--full', helpPane.hidden && !postPane.hidden)
  }
  if (event.metaKey && event.key === 'p') {
    postPane.toggleAttribute('hidden')
    rightPane.toggleAttribute('hidden', helpPane.hidden && postPane.hidden)
    postPane.classList.toggle('pane--full', helpPane.hidden && !postPane.hidden)
  }
}

function onClick (event) {
  const target = event.target
  if (target.tagName === 'BUTTON') {
    if (target.id === 'back') {
      iframe.contentWindow.history.back()
    } else if (target.id === 'forward') {
      iframe.contentWindow.history.forward()
    }
  }
}

function onResize () {
  mainEditor.refresh()
}
