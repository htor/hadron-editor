const scd = {
  start: [
    { regex: /^\s+/, token: 'whitespace' },
    { regex: /^(?:arg|classvar|const|super|this|var)\b/, token: 'keyword' },
    { regex: /^(?:false|inf|nil|true|thisFunction|thisFunctionDef|thisMethod|thisProcess|thisThread|currentEnvironment|topEnvironment)\b/, token: 'built-in' },
    { regex: /^\b\d+r[0-9a-zA-Z]*(\.[0-9A-Z]*)?/, token: 'number radix-float' },
    { regex: /^\b\d+(s+|b+|[sb]\d+)\b/, token: 'number scale-degree' },
    { regex: /^\b((\d+(\.\d+)?([eE][-+]?\d+)?(pi)?)|pi)\b/, token: 'number float' },
    { regex: /^\b0x(\d|[a-f]|[A-F])+/, token: 'number hex-int' },
    { regex: /^\b[A-Za-z_]\w*\:/, token: 'symbol symbol-arg' },
    { regex: /^[a-z]\w*/, token: 'text name' },
    { regex: /^\b[A-Z]\w*/, token: 'class' },
    { regex: /^\b_\w+/, token: 'primitive' },
    { regex: /^\\\w*/, token: 'symbol' },
    { regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: 'symbol' },
    { regex: /^\$\\?./, token: 'char' },
    { regex: /^~\w+/, token: 'env-var' },
    { regex: /^\/\/[^\r\n]*/, token: 'comment single-line-comment' },
    { regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: 'string' },
    { regex: /^[-.,;#()\[\]{}]/, token: 'text punctuation' },
    { regex: /\/\*/, push: 'comment', token: 'comment multi-line-comment' },
    { regex: /^[+\-*/&\|\^%<>=!?]+/, token: 'text operator' },
  ],
  comment: [
    { regex: /\*\//, pop: true, token: 'comment multi-line-comment' },
    { regex: /./, token: 'comment multi-line-comment' }
  ]
}

module.exports = scd
