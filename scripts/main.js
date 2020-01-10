const fs = require('fs')
const path = require('path')
const glob = require('glob')
const { app, dialog, BrowserWindow } = require('electron')
const { TEMP_PATH, INSTALLATION_PATH, APPSUPPORT_PATH } = require('./utils')
let mainWindow

if (require('electron-squirrel-startup')) return

function showError (message) {
  const target = mainWindow || null
  const logFile = path.resolve(TEMP_PATH, 'hadron-editor.txt')
  const advice = `See ${logFile} for details`
  dialog.showMessageBoxSync(target, {
    type: 'error',
    message: 'Oops! Something bad happened',
    detail: message ? `${message}\n\n${advice}` : advice
  })
  message = `\n${new Date().toLocaleString()}\nError: ${message.toString()}`
  console.error(message)
  fs.appendFileSync(logFile, message)
}

function showConfirmation (question, message) {
  const target = mainWindow || null
  return dialog.showMessageBoxSync(target, {
    type: 'question',
    message: question,
    buttons: ['OK', 'Cancel'],
    detail: message
  })
}

function checkInstallation () {
  if (!fs.existsSync(INSTALLATION_PATH)) {
    showError('Can\'t find the SuperCollider installation. ' +
              'Have you installed it in a non-standard location?')
    app.exit(1)
  } else if (!fs.existsSync(APPSUPPORT_PATH)) {
    showError('Can\'t find the SuperCollider application files. ' +
              'Please open SuperCollider at least once first to create them.')
    app.exit(1)
  }
}

function createWindow () {
  dialog.showErrorBox = (title, content) => {
    showError(`${title}\n${content}\n`)
  }
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  const webContents = mainWindow.webContents
  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1)
    webContents.setVisualZoomLevelLimits(1, 1)
    webContents.setLayoutZoomLevelLimits(0, 0)
  })
  webContents.openDevTools()
}

// to make iframing docs work
app.commandLine.appendSwitch('disable-site-isolation-trials')

app.on('ready', async () => {
  checkInstallation()
  createWindow()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

exports.showError = showError
exports.showConfirmation = showConfirmation
