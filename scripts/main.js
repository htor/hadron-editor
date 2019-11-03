const fs = require('fs')
const { app, dialog, Menu, BrowserWindow} = require('electron')
const menu = require('./menu')
let mainWindow

function showError (message) {
  const target = mainWindow || null
  dialog.showMessageBox(target, {
    type: 'error',
    message: 'Oops! Something bad happened',
    detail: 'See /tmp/sc-editor.log for details'
  })
  message = `\n${new Date().toLocaleString()}\n${message.toString()}`
  console.error(message)
  fs.appendFileSync('/tmp/sc-editor.log', message)
}

function symlinkStyles () {
  const styles = require.resolve('codemirror/lib/codemirror.css')
  try {
    fs.symlinkSync(styles, 'styles/codemirror.css')
  } catch (err) {
  }
}

function createWindow () {
  dialog.showErrorBox = (title, content) => {
    showError(`${title}\n${content}\n`)
  }
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
  menu.setup(mainWindow)
}

// to make iframing docs work
app.commandLine.appendSwitch('disable-site-isolation-trials')

app.on('ready', async () => {
  symlinkStyles()
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

exports.showError = showError
