const fs = require('fs')
const { app, shell, dialog, Menu } = require('electron')
const isMac = process.platform === 'darwin'

async function setup (window) {
  const runJavaScript = (code) => window.webContents.executeJavaScript(code)
  const isDarkMode = await runJavaScript("localStorage.getItem('dark-mode')") === 'true'
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open ...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const path = dialog.showOpenDialogSync(window, {
              filters: [{ name: 'SuperCollider', extensions: ['sc', 'scd'] }]
            })
            if (path) {
              const file = fs.readFileSync(path[0], 'utf-8')
              runJavaScript(`mainEditor.setValue(\`${file}\`)`)
              runJavaScript(`document.title = '${path[0]}'`)
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const title = await runJavaScript('document.title')
            const path = title === 'Untitled' ? dialog.showSaveDialogSync(window) : title
            if (path) {
              const file = await runJavaScript(`mainEditor.getValue()`)
              runJavaScript(`document.title = '${path}'`)
              fs.writeFileSync(path, file)
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const path = dialog.showSaveDialogSync(window)
            if (path) {
              const file = await runJavaScript(`mainEditor.getValue()`)
              runJavaScript(`document.title = '${path}'`)
              fs.writeFileSync(path, file)
            }
          }
        },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' , accelerator: 'CmdOrCtrl+Alt+R' },
        { role: 'forcereload', accelerator: 'CmdOrCtrl+Alt+Shift+R' },
        { role: 'toggledevtools'},
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'zoom' },
        {
          label: 'Dark mode',
          type: 'checkbox',
          checked: isDarkMode,
          click: (item) => {
            runJavaScript(`document.body.classList.toggle('dark-mode', ${item.checked})`)
            runJavaScript(`iframe.contentDocument.documentElement.classList.toggle('dark-mode', ${item.checked})`)
            runJavaScript(`localStorage.setItem('dark-mode', '${item.checked}')`)
          }
        },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Keyboard shortcuts',
          click: async () => {
            await shell.openExternal('https://github.com/htor/sc-editor/#usage')
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

exports.setup = setup
