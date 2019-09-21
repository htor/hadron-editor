const editor = require('./scripts/editor')
const help = require('./scripts/help')

const main = document.querySelector('#code textarea')
const code = editor.init(main)

window.addEventListener('resize', () => code.refresh())

document.addEventListener('click', (event) => {
  const target = event.target
  if (target.tagName === 'A' && target.href && target.closest('#docs')) {
    event.preventDefault()
    const link = target
    const href = link.getAttribute('href')
    help.go(href)
  } else if (target.tagName === 'BUTTON') {
    const button = target
    if (button.id === 'back') help.back()
    if (button.id === 'forward') help.forward()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'q' && event.metaKey) {
    if (!confirm('Are you sure?')) {
      event.preventDefault()
    }
  }
})

help.go('Classes/IdentityDictionary')
// help.go('Guides/Tour_Of_UGens')
// help.go('Classes/SinOsc')
// help.go('Guides/Multichannel-Expansion')
// help.go('Reference/Adverbs')
// help.go('Guides/WritingHelp')
// help.go('Reference/SCDocSyntax#Lists and tables')
