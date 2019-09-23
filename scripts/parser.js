const fs = require('fs')
const path = require('path')
const ohm = require('ohm-js')
const linkify = require('linkify-it')()
const { HELPDIR, hash } = require('./utils')

const grammar = ohm.grammar(fs.readFileSync('./syntaxes/schelp.ohm', 'utf-8'))
const doc = { methods: {}, currentMethods: [] }

const semantics = grammar.createSemantics().addOperation('emit', {
  Document (ElementOrText) {
    let html = ElementOrText.emit().join('\n')
    if (doc.related) {
      html += `<h2>Related</h2> <p>${doc.related}</p>`
    }
    const links = (linkify.match(html) || []).filter((match) => match.schema)
    for (const link of links) {
      const anchor = `<a href="${link.url}" title="${link.url}">${link.text}</a>`
      html = html.replace(link.text, anchor)
    }
    return html.replace(/\\::/g, '::')
  },
  Class (tag, line) {
    const title = doc.title = getMatch(line).trim()
    return `<h1>${title}</h1>`
  },
  Title (tag, line) {
    const title = doc.title = getMatch(line).trim()
    return `<h1>${title}</h1>`
  },
  Summary (tag, line) {
    return `<blockquote>${getMatch(line).trim()}</blockquote>`
  },
  Related (tag, line) {
    const related = getMatch(line)
    const links = related.split(/\s*,\s*/).map((href) =>
      `<a href="${href}" title="${href}">${href.split('/').pop()}</a>`
    ).join(', ')
    doc.related = links
  },
  Redirect (tag, line) {
    return `<p>Redirect: ${getMatch(line).trim()}</p>`
  },
  Categories (tag, line) {
    return ''
  },
  ClassTree (tag, line) {
    return `<p>Classtree: ${getMatch(line).trim()}</p>`
  },
  Note (tag, ElementOrText, tagEnd) {
    return `<p><strong>Note:</strong> ${ElementOrText.emit().join(' ')}</p>`
  },
  Warning (tag, ElementOrText, tagEnd) {
    return `<p>Warning:<br>${ElementOrText.emit().join(' ')}</p>`
  },
  Footnote (tag, ElementOrText, tagEnd) {
    return `<p>Footnote:<br>${ElementOrText.emit().join(' ')}</p>`
  },
  Section (tag, line) {
    const title = getMatch(line).trim()
    const hashed = hash(title)
    return `<h2><a id="${hashed}">${title}</a></h2>`
  },
  SubSection (tag, line) {
    const title = getMatch(line).trim()
    const hashed = hash(title)
    return `<h3><a id="${hashed}">${title}</a></h3>`
  },
  Examples (tag) {
    return '<h2>Examples</h2>'
  },
  Description (tag) {
    const hashed = hash('Description')
    return `<h2><a id="${hashed}">Description</a></h2>`
  },
  ClassMethods (tag) {
    return '<h2>Class methods</h2>'
  },
  InstanceMethods (tag) {
    return '<h2>Instance methods</h2>'
  },
  Method (tag, line, Paragraph, Argument, Returns, Discussion) {
    const names = getMatch(line).trim().split(/\s*,\s*/)
    const description = Paragraph.emit().join(' ')
    let methods = ''
    let args
    for (const name of names) {
      const hashed = hash(name)
      doc.methods[name] = { args: [] }
      doc.currentMethods.push(name)
      args = Argument.emit().join(' ')
      const argsList = doc.methods[name].args.join(', ')
      methods += `<h3><a id="${hashed}">${name}(${argsList})</a></h3>`
    }
    doc.currentMethods = []
    return `
      <div>
        ${methods}
        ${description}
        <ul>
          ${args}
        </ul>
      </div>
    `
  },
  Argument (tag, line, Paragraph) {
    const name = getMatch(line).trim()
    for (const currentMethod of doc.currentMethods) {
      doc.methods[currentMethod].args.push(name)
    }
    return `<li><strong>${name}</strong>: ${Paragraph.emit()}</li>`
  },
  Returns (tag, Paragraph) {
    return `<p>Returns<br>${Paragraph.emit().join(' ')}</p>`
  },
  Discussion (tag, Paragraph) {
    return '<p>Discussion</p>'
  },
  Private (tag, line) {
    return `<h4>Private ${getMatch(line).trim()}</h4>`
  },
  Keyword (tag, line) {
    return ''
  },
  UnorderedList (tag, ListItem, tagEnd) {
    return `<ul>${ListItem.emit().join(' ')}</ul>`
  },
  OrderedList (tag, ListItem, tagEnd) {
    return `<ol>${ListItem.emit().join(' ')}</ol>`
  },
  DefinitionList (tag, DefinitionItem, tagEnd) {
    return `<dl>${DefinitionItem.emit().join(' ')}</dl>`
  },
  ListItem (delimiter, ElementOrText) {
    return `<li>${ElementOrText.emit().join(' ')}</li>`
  },
  DefinitionItem (delimiter, ElementOrText, delimiterMaybe, ElementOrTextMaybe) {
    return `<dt>${ElementOrText.emit().join(' ')}<dt><dd>${ElementOrTextMaybe.emit().join(' ')}</dd>`
  },
  Tree (tag, TreeItem, tagEnd) {
    return 'Tree:'
  },
  Table (tag, TableRow, tagEnd) {
    return `<table>${TableRow.emit()}</table>`
  },
  TableRow (delimiter, TableCellMaybe) {
    return `<tr>${TableCellMaybe.emit()}</tr>`
  },
  TableCell (ElementOrText, delimiter) {
    return `<td>${ElementOrText.emit().join(' ')}</td>`
  },
  // Classes/SimpleNumber#-trunc#trunc
  Link (tag, any, tagEnd) {
    const [path, anchor] = getMatch(any).split('#')
    const href = anchor ? `${path}#${anchor}` : path
    const title = href.split('/').pop()
    return `<a href="${href}" title="${href}">${title}</a>`
  },
  Anchor (tag, any, tagEnd) {
    const name = getMatch(any)
    return `<a name="${name}">${name}</a>`
  },
  Emphasis (tag, any, tagEnd) {
    return `<em>${getMatch(any)}</em>`
  },
  Strong (tag, any, tagEnd) {
    return `<strong>${getMatch(any)}</strong>`
  },
  Soft (tag, any, tagEnd) {
    return `<i>${getMatch(any)}</i>`
  },
  Image (tag, any, tagEnd) {
    const [file, title] = getMatch(any).split('#')
    const dir = doc.url.split('/').shift()
    const full = path.resolve(HELPDIR, dir, file)
    return `
      <figure>
        <img src="${full}" alt="${title || file}">
        <figcaption>${title || file}</figcaption>
      </figure>
    `
  },
  Text (text) {
    return getMatch(text)
  },
  codeInline (tag, any, tagEnd) {
    return `<code>${getMatch(any).trim()}</code>`
  },
  code (tag, any, notEolAndSep, followedByEolAndSep, eol, tagEnd) {
    return `<textarea>${getMatch(any).trim()}</textarea>`
  },
  teletypeInline (tag, any, tagEnd) {
    return `<code>${getMatch(any).trim()}</code>`
  },
  teletype (tag, any, notEolAndSep, followedByEolAndSep, eol, tagEnd) {
    return `<pre><code>${getMatch(any).trim()}</code></pre>`
  }
})

function getMatch (node) {
  const { startIdx, endIdx, sourceString } = node.source
  const match = sourceString.slice(startIdx, endIdx)
  return match
}

function parse (text, url) {
  doc.url = url
  const result = grammar.match(text)
  const succeeded = result.succeeded()
  if (!succeeded) {
    throw new Error(result.message)
  } else {
    return semantics(result).emit()
  }
}

function verify () {
  const dirs = [
    '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource/Classes',
    '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource/Guides',
    '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource/Overviews',
    '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource/Reference',
    '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource/Tutorials'
  ]

  const errors = []
  let total = 0

  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.schelp'))
    for (let i = 0; i < files.length; i++) {
      const full = path.resolve(dir, files[i])
      const input = fs.readFileSync(full, 'utf-8')
      const result = grammar.match(input)
      const succeeded = result.succeeded()
      total++
      console.log(`${i + 1}/${files.length} ${succeeded ? 'succeeded' : 'failed'} ${full}`)
      if (!succeeded) {
        errors.push({
          message: result.message,
          file: full
        })
      }
    }
  }

  if (!errors.length) {
    console.log('All files successfully matched!')
  } else {
    for (const error of errors) {
      console.log('-------------------')
      console.log(error.file)
      console.log(error.message)
    }
    console.log(`${errors.length} of ${total} files did not match`)
  }
}

exports.parse = parse
exports.verify = verify
