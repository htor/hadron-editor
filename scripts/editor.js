const { sclang } = require('electron').remote.require('./main')
const CodeMirror = require('codemirror')
require('codemirror/addon/mode/simple')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/comment/comment')
const syntax = require('./syntax.js')
const output = document.querySelector('#post output')

function setup () {
  CodeMirror.defineSimpleMode('scd', syntax)
  sclang.on('stdout', (message) => post(message, 'info'))
  sclang.on('stderr', (message) => post(message, 'error'))
}

function attach (textarea) {
  const editor = CodeMirror.fromTextArea(textarea, {
    mode: 'scd',
    value: textarea.value,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      Tab: () => editor.replaceSelection('  '),
      'Cmd-Enter': () => evaluate(selectRegion(editor)),
      'Shift-Enter': () => evaluate(selectLine(editor)),
      'Shift-Cmd-K': () => editor.toggleComment(),
      'Cmd-.': () => evaluate('CmdPeriod.run'),
      'Cmd-D': () => {
        const range = editor.findWordAt(editor.getCursor())
        const word = editor.getRange(range.anchor, range.head)
        // help.lookup(word)
      }
    }
  })

  editor.on('dblclick', (editor) => {
    const cursor = editor.getCursor()
    const line = editor.getLine(cursor.line)
    if (line.slice(cursor.ch - 1, cursor.ch).match(/[()]/)) {
      editor.undoSelection()
      selectRegion(editor, false)
    }
  })

  editor.on('blur', (editor) => {
    editor.setSelection(editor.getCursor(), null, { scroll: false })
  })

  return editor
}


async function evaluate (code) {
  let result
  try {
    result = await sclang.interpret(code)
  } catch (error) {
    return post(stringifyError(error), 'error')
  }
  post(stringify(result))
}

function stringify (value) {
  if (value === null) return 'nil'
  if (Array.isArray(value)) return `[ ${value.map(stringify).join(', ')} ]`
  if (value.string) return value.string
  return String(value).replace('CmdPeriod', '')
}

function stringifyError (value) {
  const { type, error } = value
  if (type === 'SyntaxError') {
    value = `${type}: ${error.msg}`
    value += `\n    line: ${error.line}, char: ${error.charPos}`
    value += `\n${error.code}`
  } else if (type === 'Error') {
    const args = error.args.map((arg) => `${arg.class} ${arg.asString}`).join(', ')
    const receiver = error.receiver
    value = error.errorString.replace('ERROR', error.class)
    value += `\n    receiver: ${receiver.asString}, args: [${args}]`
  }
  return value
}

function post (message, type = 'value') {
  const lines = output.querySelector('ul')
  const line = document.createElement('li')
  line.classList.add(type)
  line.innerHTML = `<pre>${message}</pre>`
  lines.appendChild(line)
  line.scrollIntoView()
}

function selectRegion (editor, markSelection = true) {
  const cursor = editor.getCursor()
  const line = editor.getLine(cursor.line)

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

  if (editor.somethingSelected()) {
    return selectLine(editor, markSelection)
  }

  // Adjust cursor before finding parens
  if (line.slice(cursor.ch, cursor.ch + 1) === '(') {
    editor.setCursor(Object.assign(cursor, { ch: cursor.ch + 1 }))
  } else if (line.slice(cursor.ch - 1, cursor.ch) === ')') {
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
  if (parenPairs.length === 0) {
    return selectLine(editor, markSelection)
  }

  const pair = parenPairs.pop()
  left = pair[0]
  right = pair[1]

  // Parens are inline
  if (left.ch > 0) {
    return selectLine(editor, markSelection)
  }

  // Parens are a region
  if (markSelection) {
    const marker = editor.markText(left, right, { className: 'text-marked' })
    setTimeout(() => marker.clear(), 300)
    return editor.getRange(left, right)
  } else {
    editor.addSelection(left, right)
    return editor.getSelection()
  }
}

function selectLine (editor, markSelection = true) {
  const cursor = editor.getCursor()
  let from, to
  if (editor.somethingSelected()) {
    from = editor.getCursor('start')
    to = editor.getCursor('end')
  } else {
    from = { line: cursor.line, ch: 0 }
    to = { line: cursor.line, ch: editor.getLine(cursor.line).length }
  }
  if (markSelection) {
    const marker = editor.markText(from, to, { className: 'text-marked' })
    setTimeout(() => marker.clear(), 300)
  }
  return editor.getRange(from, to)
}

exports.setup = setup
exports.attach = attach
