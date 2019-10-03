const fs = require('fs')
const sc = require('supercolliderjs')
const { app, BrowserWindow } = require('electron')
let mainWindow, sclang

async function bootSclang () {
  try {
    sclang = await sc.lang.boot({
      stdin: false,
      echo: false,
      debug: false
    })
  } catch (error) {
    console.error(error)
    app.exit(1)
  }
}

function symlinkStyle () {
  try {
    fs.symlinkSync('../node_modules/codemirror/lib/codemirror.css', 'styles/codemirror.css')
  } catch (err) {
  }
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.commandLine.appendSwitch('disable-site-isolation-trials')

app.on('ready', async () => {
  await bootSclang()
  exports.sclang = sclang
  symlinkStyle()
  createWindow()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', async () => {
  mainWindow = null
})

app.on('quit', async () => {
  await sclang.interpret('s.quit')
})
