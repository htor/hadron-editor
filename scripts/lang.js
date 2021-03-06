const scjs = require('supercolliderjs')
const { showError } = require('electron').remote.require('./main')
const { INSTALLATION_PATH } = require('./utils')
const gui = require('./gui')
let sclang

async function boot () {
  const options = {
    stdin: false,
    echo: false,
    debug: false,
    sclang: INSTALLATION_PATH
  }
  sclang = new scjs.lang.SCLang(await scjs.resolveOptions(null, options))
  sclang.on('stdout', (message) => gui.post(message, 'info'))
  sclang.on('stderr', (message) => gui.post(message, 'error'))
  sclang.on('exit', () => {
    for (const event of ['stdout', 'stderr', 'exit']) {
      sclang.removeAllListeners(event)
    }
    sclang = null
  })
  try {
    await sclang.boot()
  } catch (error) {
    console.error(error)
    showError(error)
  }
}

async function quit () {
  await sclang.quit()
  sclang = null
}

async function reboot () {
  await quit()
  await boot()
}

async function evaluate (code, silently) {
  if (!code) return ''
  try {
    const result = await sclang.interpret(code, null, true, false)
    if (!silently) gui.post(result)
  } catch (error) {
    gui.post(stringifyError(error), 'error')
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
    const receiver = error.receiver || 'no receiver'
    error.errorString = error.errorString || 'UnknownError'
    error.class = error.class || ''
    value = error.errorString.replace('ERROR', error.class)
    value += `\n    receiver: ${receiver.asString}, args: [${args}]`
  }
  return value
}

exports.boot = boot
exports.quit = quit
exports.reboot = reboot
exports.evaluate = evaluate
