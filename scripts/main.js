const sc = require('supercolliderjs')
const { app, BrowserWindow } = require('electron')

let window, sclang

async function bootServer () {
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
  exports.sclang = sclang
}

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

app.on('ready', async () => {
  await bootServer()
  createWindow()
})
app.on('window-all-closed', () => {
  app.quit()
})
app.on('activate', () => {
  if (window === null) {
    createWindow()
  }
})
