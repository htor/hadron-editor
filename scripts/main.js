const fs = require('fs')
const package = require('../package.json')
const { app, dialog, BrowserWindow } = require('electron')
const { LOGFILE_PATH, INSTALLATION_PATH, APPSUPPORT_PATH } = require('./utils')
let mainWindow

if (require('electron-squirrel-startup')) return

function log (message) {
  console.error(message)
  fs.appendFileSync(LOGFILE_PATH, `${message}\n`, 'utf8')
}

function showError (message) {
  const target = mainWindow || null
  const advice = `See ${LOGFILE_PATH} for details`
  message = message ? `${message.toString()}\n${advice}` : advice
  log(`Error: ${message}`)
  dialog.showMessageBoxSync(target, {
    type: 'error',
    message: 'Oops! Something bad happened',
    detail: message
  })
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
  // webContents.openDevTools()
}

// to make iframing docs work
app.commandLine.appendSwitch('disable-site-isolation-trials')

app.on('ready', async () => {
  log(`\nhadron v${package.version}`);
  log(`Executable path: ${INSTALLATION_PATH}`);
  log(`Application files path: ${APPSUPPORT_PATH}`);
  log(`Log file path: ${LOGFILE_PATH}`);
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
