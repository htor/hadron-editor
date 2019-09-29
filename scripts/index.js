const { sclang } = require('electron').remote.require('./main')
const editor = require('./scripts/editor')
const help = require('./scripts/help')

const editPane = document.querySelector('#editor')
const helpPane = document.querySelector('#help')
const postPane = document.querySelector('#post')
const mainEditor = editor.setup(editPane.querySelector('textarea'))
mainEditor.focus()
help.go('Guides/Multichannel-Expansion')

window.addEventListener('resize', () => {
  mainEditor.refresh()
})

window.addEventListener('mousedown', (event) => {
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
})

document.addEventListener('click', (event) => {
  const target = event.target
  if (target.tagName === 'A' && target.href && target.closest('#doc')) {
    event.preventDefault()
    help.go(target.getAttribute('href'))
  } else if (target.tagName === 'BUTTON') {
    if (target.id === 'back') help.back()
    if (target.id === 'forward') help.forward()
  }
})

document.addEventListener('keydown', (event) => {
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
})
