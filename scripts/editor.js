const sc = require('supercolliderjs')
const CodeMirror = require('codemirror')
require('codemirror/addon/mode/simple')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/comment/comment')
const { showError } = require('electron').remote.require('./main')
const { APPSUPPORT_DIR } = require('./utils')
const syntax = require('./syntax.js')
const output = document.querySelector('#post output')
const iframe = document.querySelector('#help iframe')
let sclang

async function start () {
  CodeMirror.defineSimpleMode('scd', syntax)
  try {
    sclang = await sc.lang.boot({
      stdin: false,
      echo: false,
      debug: false
    })
  } catch (error) {
    console.log(error)
    showError(error)
  }
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
      Esc: () => editor.setCursor(editor.getCursor()),
      'Shift-Enter': () => evalLine(editor),
      'Cmd-D': false,
      'Ctrl-D': false
    }
  })
  editor.on('blur', (editor) => {
    editor.setSelection(editor.getCursor(), null, { scroll: false })
  })
  return editor
}

function duplicateLine (editor) {
  const cursor = editor.getCursor()
  const line = editor.getLine(cursor.line)
  editor.replaceRange(`\n${line}`, { line: cursor.line })
}

function selectLine (editor) {
  const cursor = editor.getCursor()
  const from = { line: cursor.line, ch: 0 }
  const to = { line: cursor.line + (editor.somethingSelected() ? 1 : 0) }
  editor.setExtending(true)
  editor.extendSelection(from, to)
  editor.setExtending(false)
}

function evalLine (editor) {
  const cursor = editor.getCursor()
  let from, to
  if (editor.somethingSelected()) {
    from = editor.getCursor('start')
    to = editor.getCursor('end')
  } else {
    from = { line: cursor.line, ch: 0 }
    to = { line: cursor.line, ch: Infinity }
  }
  evaluate(editor.getRange(from, to))
  markText(editor, from, to)
}

function evalRegion (editor) {
  const cursor = editor.getCursor()
  const ranges = []
  let brackets = 0

  if (editor.somethingSelected()) {
    return evalLine(editor)
  }

  for (let i = 0; i < editor.lineCount(); i++) {
    const line = editor.getLine(i)
    for (let j = 0; j < line.length; j++) {
      const char = line.charAt(j)
      const type = editor.getTokenTypeAt({ line: i, ch: j + 1 }) || ''
      const skip = type.match(/^(comment|string|symbol|char)/)
      if (skip) continue
      if (char === '(' && brackets++ === 0) {
        ranges.push([i])
      } else if (char === ')' && --brackets === 0) {
        ranges[ranges.length - 1].push(i)
      }
    }
  }

  const range = ranges.find((range) => {
    return range[0] <= cursor.line && cursor.line <= range[1]
  })

  if (range) {
    const from = { line: range[0], ch: 0 }
    const to = { line: range[1], ch: Infinity }
    evaluate(editor.getRange(from, to))
    markText(editor, from, to)
  } else {
    evalLine(editor)
  }
}

function markText (editor, from, to) {
  const marker = editor.markText(from, to, { className: 'text-marked' })
  setTimeout(() => marker.clear(), 300)
}

async function evaluate (code) {
  if (!code) return ''
  try {
    const result = await sclang.interpret(code, null, true, false)
    post(result)
  } catch (error) {
    post(stringifyError(error), 'error')
  }
}

function stringifyError (value) {
  const { type, error } = value
  if (type === 'SyntaxError') {
    value = `${type}: ${error.msg}`
    value += `\n    line: ${error.line}, char: ${error.charPos}`
    value += `\n${error.code}`
  } else if (type === 'Error') {
    const args = (error.args || []).map((arg) => `${arg.class} ${arg.asString}`).join(', ')
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

function lookupWord (editor) {
  let range, word, page
  if (editor.somethingSelected()) {
    const from = editor.getCursor('start')
    const to = editor.getCursor('end')
    word = editor.getRange(from, to)
  } else {
    range = editor.findWordAt(editor.getCursor())
    word = editor.getRange(range.anchor, range.head)
  }
  const docmap = window.docmap
  const first = word.charAt(0)
  const isUpperCase = first === first.toUpperCase()
  if (!word || word.match(/^\W/)) return
  if (isUpperCase) {
    if (docmap[`Classes/${word}`]) {
      page = `/Classes/${word}.html`
    } else {
      page = `/Search.html#${word}`
    }
  } else {
    found: {
      for (const doc in docmap) {
        if (docmap[doc].methods.find((m) => m.slice(2) === word)) {
          page = `/Overviews/Methods.html#${word}`
          break found
        }
      }
      page = `/Search.html#${word}`
    }
  }
  iframe.src = `file://${APPSUPPORT_DIR}${page}`
}

exports.start = start
exports.attach = attach
exports.selectLine = selectLine
exports.duplicateLine = duplicateLine
exports.evaluate = evaluate
exports.evalLine = evalLine
exports.evalRegion = evalRegion
exports.lookupWord = lookupWord
