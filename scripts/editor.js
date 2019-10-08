const CodeMirror = require('codemirror')
require('codemirror/addon/mode/simple')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/comment/comment')
const { sclang } = require('electron').remote.require('./main')
const { APPSUPPORT_DIR } = require('./utils')
const syntax = require('./syntax.js')
const output = document.querySelector('#post output')

function setup () {
  CodeMirror.defineSimpleMode('scd', syntax)
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
      'Cmd-D': () => lookupWord(editor)
    }
  })
  editor.on('blur', (editor) => {
    editor.setSelection(editor.getCursor(), null, { scroll: false })
  })
  return editor
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
  const first = word.charAt(0)
  const isUpperCase = first === first.toUpperCase()
  if (!word || word.match(/^\W/)) return
  if (isUpperCase) {
    if (docmap[`Classes/${word}`]) {
      page = `/Classes/${word}.html`
    } else {
      page = `/Search.html#${word}`
    }
  } else found: {
    for (const doc in docmap) {
      if (docmap[doc].methods.find((m) => m.slice(2) === word)) {
        page = `/Overviews/Methods.html#${word}`;
        break found;
      }
    }
    page = `/Search.html#${word}`
  }
  iframe.src = `file://${APPSUPPORT_DIR}${page}`
}

function selectRegion (editor) {
  const cursor = editor.getCursor()
  const ranges = []
  let brackets = 0

  if (editor.somethingSelected()) {
    return selectLine(editor)
  }

  for (let i = 0; i < editor.lineCount(); i++) {
    const line = editor.getLine(i)
    for (let j = 0; j < line.length; j++) {
      const char = line.charAt(j)
      const type = editor.getTokenTypeAt({ line: i, ch: j + 1 })
      const skip = type.match(/^(comment|string|symbol|char)/)
      if (skip) continue
      if (char === '(') {
        if (brackets++ === 0) {
          ranges.push([i + j])
        }
      } else if (char === ')') {
        if (--brackets === 0) {
          ranges[ranges.length - 1].push(i + j)
        }
      }
    }
  }

  const range = ranges.find((range) => {
    return range[0] <= cursor.line && cursor.line <= range[1]
  })

  if (range) {
    const from = { line: range[0], ch: 0 }
    const to = { line: range[1], ch: Infinity }
    const marker = editor.markText(from, to, { className: 'text-marked' })
    setTimeout(() => marker.clear(), 300)
    return editor.getRange(from, to)
  } else {
    return selectLine(editor)
  }
}

function selectLine (editor) {
  const cursor = editor.getCursor()
  let from, to
  if (editor.somethingSelected()) {
    from = editor.getCursor('start')
    to = editor.getCursor('end')
  } else {
    from = { line: cursor.line, ch: 0 }
    to = { line: cursor.line, ch: Infinity }
  }
  const marker = editor.markText(from, to, { className: 'text-marked' })
  setTimeout(() => marker.clear(), 300)
  return editor.getRange(from, to)
}

async function evaluate (code) {
  if (!code) return ''
  try {
    const result = await sclang.interpret(code)
    post(stringify(result))
  } catch (error) {
    post(stringifyError(error), 'error')
  }
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

exports.setup = setup
exports.attach = attach
exports.post = post
