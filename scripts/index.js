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

// help.go('Guides/Multichannel-Expansion')
// help.go('Classes/Object#-multiChannelPerform')
help.go('Guides/J-concepts-in-SC')
// help.go('Reference/SCDocSyntax')
