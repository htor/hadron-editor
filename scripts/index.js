const { shell } = require('electron')
const editor = require('./scripts/editor')
const help = require('./scripts/help')
const mainEditor = editor.setup(document.querySelector('#editor textarea'))

window.addEventListener('resize', () => {
  mainEditor.refresh()
})

document.addEventListener('click', (event) => {
  const target = event.target
  if (target.tagName === 'A' && target.href && target.closest('#docs')) {
    event.preventDefault()
    const link = target
    const href = link.getAttribute('href')
    if (href.startsWith('http')) {
      shell.openExternal(href)
    } else {
      help.go(href)
    }
  } else if (target.tagName === 'BUTTON') {
    const button = target
    if (button.id === 'back') help.back()
    if (button.id === 'forward') help.forward()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'q' && event.metaKey) {
    if (!window.confirm('Are you sure?')) {
      event.preventDefault()
    }
  }
})

// help.go('Classes/IdentityDictionary')
// help.go('Guides/Tour_Of_UGens')
// help.go('Classes/SinOsc')
// help.go('Classes/PMOsc')
help.go('Guides/Multichannel-Expansion')
// help.go('Reference/Adverbs')
// help.go('Guides/WritingHelp')
// help.go('Reference/SCDocSyntax')
// help.go('Classes/HenonC')
// help.go('Help')

mainEditor.focus()
