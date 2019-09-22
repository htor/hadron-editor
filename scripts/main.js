const { app, BrowserWindow } = require('electron')
const supercollider = require('supercolliderjs')

let window

function createWindow () {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  window.loadFile('index.html')
  window.webContents.openDevTools()

  window.on('closed', () => {
    window = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (window === null) {
    createWindow()
  }
})

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

let sclang

async function boot () {
  try {
    sclang = await supercollider.lang.boot({
      debug: false
    })
  } catch (err) {
    console.log('err', err)
  }
  await sclang.interpret(`
    s.boot
  `)
  return sclang
}

async function evaluate (code) {
  let result
  try {
    result = await sclang.interpret(code)
    result = result.string ? result.string : String(result)
  } catch (error) {
    result = error.message
  }
  return result
}

async function start () {
  console.log('Booting SuperCollider server...')
  await boot()
  await sleep(3000) // wait for server to become available
  console.log('Booted server...')
}

start()

exports.evaluate = evaluate
