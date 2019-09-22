const CodeMirror = require('codemirror')
require('codemirror/addon/mode/simple')
const { evaluate } = require('electron').remote.require('./main.js')
const scd = require('../syntaxes/scd')
const help = require('./help')

CodeMirror.defineSimpleMode('scd', scd)

function init (textarea) {
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: 'scd',
    value: textarea.value,
    lineWrapping: true,
    extraKeys: {
      Tab: (cm) => cm.replaceSelection('    '),
      'Cmd-Enter': async () => {
        const result = await evaluate(selectRegion())
        post(result)
      },
      'Shift-Enter': async () => {
        const result = await evaluate(selectLine())
        post(result)
      },
      'Cmd-D': (cm) => {
        const range = cm.findWordAt(cm.getCursor())
        const word = cm.getRange(range.anchor, range.head)
        help.lookup(word)
      },
      'Cmd-.': async () => {
        post('CmdPeriod.run')
        await evaluate('CmdPeriod.run')
      }
    }
  })

  editor.on('dblclick', (editor) => {
    const cursor = editor.getCursor()
    const line = editor.getLine(cursor.line)
    if (line.slice(cursor.ch - 1, cursor.ch).match(/[()]/)) {
      editor.undoSelection()
      selectRegion({ flash: false })
    }
  })

  editor.on('blur', (editor) => {
    editor.setSelection(editor.getCursor(), null, { scroll: false })
  })

  // Returns the code selection, line or region
  function selectRegion (options = { flash: true }) {
    const range = window.getSelection().getRangeAt(0)
    const textarea = range.startContainer.parentNode.previousSibling
    if (!textarea) return
    const cursor = editor.getCursor()

    if (editor.somethingSelected()) return selectLine(options)

    function findLeftParen (cursor) {
      const left = editor.findPosH(cursor, -1, 'char')
      const char = editor.getLine(left.line).slice(left.ch, left.ch + 1)
      const token = editor.getTokenTypeAt(cursor) || ''
      if (left.hitSide) return left
      if (token.match(/^(comment|string|symbol|char)/)) return findLeftParen(left)
      if (char === ')') return findLeftParen(findLeftParen(left))
      if (char === '(') return left
      return findLeftParen(left)
    }

    function findRightParen (cursor) {
      const right = editor.findPosH(cursor, 1, 'char')
      const char = editor.getLine(right.line).slice(right.ch - 1, right.ch)
      const token = editor.getTokenTypeAt(cursor) || ''
      if (right.hitSide) return right
      if (token.match(/^(comment|string|symbol|char)/)) return findRightParen(right)
      if (char === '(') return findRightParen(findRightParen(right))
      if (char === ')') return right
      return findRightParen(right)
    }

    // Adjust cursor before finding parens
    if (editor.getLine(cursor.line).slice(cursor.ch, cursor.ch + 1) === '(') {
      editor.setCursor(Object.assign(cursor, { ch: cursor.ch + 1 }))
    } else if (editor.getLine(cursor.line).slice(cursor.ch - 1, cursor.ch) === ')') {
      editor.setCursor(Object.assign(cursor, { ch: cursor.ch - 1 }))
    }

    const parenPairs = []
    let left = findLeftParen(cursor)
    let right = findRightParen(cursor)

    while (!left.hitSide || !right.hitSide) {
      parenPairs.push([left, right])
      left = findLeftParen(left)
      right = findRightParen(right)
    }

    // No parens found
    if (parenPairs.length === 0) return selectLine(options)

    const pair = parenPairs.pop()
    left = pair[0]
    right = pair[1]

    // Parens are inline
    if (left.ch > 0) return selectLine(options)

    // Parens are a region
    if (options.flash) {
      const marker = editor.markText(left, right, { className: 'text-flash' })
      setTimeout(() => marker.clear(), 300)
      return editor.getRange(left, right)
    } else {
      editor.addSelection(left, right)
      return editor.getSelection()
    }
  }

  // Returns the code selection or line
  function selectLine (options = { flash: true }) {
    const range = window.getSelection().getRangeAt(0)
    const textarea = range.startContainer.parentNode.previousSibling
    if (!textarea) return
    const cursor = editor.getCursor()
    let from, to

    if (editor.somethingSelected()) {
      from = editor.getCursor('start')
      to = editor.getCursor('end')
    } else {
      from = { line: cursor.line, ch: 0 }
      to = { line: cursor.line, ch: editor.getLine(cursor.line).length }
    }

    if (options.flash) {
      const marker = editor.markText(from, to, { className: 'text-flash' })
      setTimeout(() => marker.clear(), 300)
    }
    return editor.getRange(from, to)
  }

  return editor
}

function post (message) {
  const lines = document.querySelector('output ul')
  const line = document.createElement('li')
  line.textContent = message
  lines.appendChild(line)
  line.scrollIntoView()
}

exports.init = init
exports.post = post
