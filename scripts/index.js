const fs = require('fs')
const { sclang } = require('electron').remote.require('./main')
const editor = require('./scripts/editor')

// const loading = document.querySelector('#loading')
const editPane = document.querySelector('#editor')
const helpPane = document.querySelector('#help')
const postPane = document.querySelector('#post')
let mainEditor

editor.setup()
mainEditor = editor.attach(editPane.querySelector('textarea'))
mainEditor.focus()

// setTimeout(() => {
//   loading.setAttribute('hidden', '')
// }, 200)

const styles = document.createElement('style')
styles.textContent = fs.readFileSync('./styles/codemirror.css', 'utf-8')
styles.textContent += fs.readFileSync('./styles/editor.css', 'utf-8')
styles.textContent += fs.readFileSync('./styles/help.css', 'utf-8')
const iframe = helpPane.querySelector('iframe')

window.addEventListener('mousedown', mousedown)
document.addEventListener('keydown', keydown)
document.addEventListener('click', click)

iframe.addEventListener('load', () => {
  console.log('loading', iframe.src)
  const win = iframe.contentWindow
  const doc = iframe.contentDocument
  win.addEventListener('unload', () => {
    // loading.removeAttribute('hidden')
  })

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

  // setup code blocks
  doc.head.querySelectorAll('link[href="./../codemirror.css"]').forEach((el) => el.remove())
  doc.head.querySelectorAll('link[href="./../editor.css"]').forEach((el) => el.remove())
  doc.querySelectorAll('.CodeMirror').forEach((el) => el.remove())
  doc.querySelectorAll('textarea').forEach(editor.attach)

  doc.head.appendChild(styles)

  doc.addEventListener('keydown', keydown)
})

window.addEventListener('resize', () => {
  mainEditor.refresh()
})

function mousedown (event) {
  if (event.target !== editPane) return
  event.preventDefault()
  const pageWidth = document.body.offsetWidth
  const flexGrow = 2 / pageWidth
  function resize (event) {
    const left = flexGrow * event.clientX
    const right = pageWidth * flexGrow - left
    editPane.style.flexGrow = left
    helpPane.style.flexGrow = right
    postPane.style.flexGrow = right
  }
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', resize)
  })
}

function click (event) {
  const target = event.target
  if (target.tagName === 'BUTTON') {
    if (target.id === 'back') iframe.contentWindow.history.back()
    if (target.id === 'forward') iframe.contentWindow.history.forward()
  }
}

function keydown (event) {
  if (event.metaKey && event.key === 'q') {
    if (!window.confirm('Are you sure?')) {
      event.preventDefault()
    }
  }
  if (event.metaKey && event.key === 'b') sclang.interpret('s.boot')
  if (event.metaKey && event.key === 'm') sclang.interpret('s.meter')
  if (event.metaKey && event.key === 's') sclang.interpret('s.scope')
  if (event.metaKey && event.key === 'o') {
    helpPane.toggleAttribute('hidden')
    const postFull = postPane.classList.toggle('pane--bottom', !helpPane.hidden)
    editPane.classList.toggle('pane--full', postFull)
    postPane.classList.toggle('pane--full', helpPane.hidden)
  }
  if (event.metaKey && event.key === 'p') {
    postPane.toggleAttribute('hidden')
    editPane.classList.toggle('pane--full', postPane.hidden)
    helpPane.classList.toggle('pane--full', postPane.hidden)
    postPane.classList.toggle('pane--full', helpPane.hidden)
  }
}
