const fs = require('fs')
const { getCurrentWindow, app, shell, dialog, Menu } = require('electron').remote
const editor = require('./editor')
const lang = require('./lang')

function setup () {
  const mainWindow = getCurrentWindow()
  const isMac = process.platform === 'darwin'
  const iframe = document.querySelector('#right iframe')
  const leftPane = document.querySelector('#left')
  const rightPane = document.querySelector('#right')
  const helpPane = document.querySelector('#help')
  const postPane = document.querySelector('#post')
  const mainEditor = document.querySelector('#left .CodeMirror').CodeMirror
  const menuTemplate = [
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
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: (event) => {
            if (window.confirm('Sure you want to quit?')) {
              lang.evaluate('Server.default.quit')
              app.quit()
            }
          }
        }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open ...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const path = dialog.showOpenDialogSync(mainWindow, {
              filters: [{ name: 'SuperCollider', extensions: ['sc', 'scd'] }]
            })
            if (path) {
              const mainEditor = document.querySelector('#left .CodeMirror')
              mainEditor.CodeMirror.setValue(fs.readFileSync(path[0], 'utf-8'))
              document.title = path[0]
            }
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const title = document.title
            let path
            if (title === 'Untitled') {
              path = dialog.showSaveDialogSync(mainWindow, {
                filters: [{ name: 'SuperCollider', extensions: ['sc', 'scd'] }]
              })
            } else {
              path = title
            }
            if (path) {
              const file = mainEditor.getValue()
              document.title = path
              fs.writeFileSync(path, file)
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            const path = dialog.showSaveDialogSync(mainWindow, {
              filters: [{ name: 'SuperCollider', extensions: ['sc', 'scd'] }]
            })
            if (path) {
              const file = mainEditor.getValue()
              document.title = path
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
        {
          label: 'Select line',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') ||
            iframe.contentDocument.querySelector('.CodeMirror-focused')
            editor.selectLine(focusedEditor.CodeMirror)
          }
        },
        {
          label: 'Comment line',
          accelerator: 'CmdOrCtrl+Shift+K',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') ||
            iframe.contentDocument.querySelector('.CodeMirror-focused')
            focusedEditor.CodeMirror.toggleComment()
          }
        },
        {
          label: 'Duplicate line',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') ||
            iframe.contentDocument.querySelector('.CodeMirror-focused')
            editor.duplicateLine(focusedEditor.CodeMirror)
          }
        },
        ...(isMac ? [
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
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'Language',
      submenu: [
        {
          label: 'Evaluate region',
          accelerator: 'CmdOrCtrl+Enter',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') ||
            iframe.contentDocument.querySelector('.CodeMirror-focused')
            editor.evalRegion(focusedEditor.CodeMirror)
          }
        },
        {
          label: 'Evaluate line',
          accelerator: 'Shift+Enter',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') ||
            iframe.contentDocument.querySelector('.CodeMirror-focused')
            editor.evalLine(focusedEditor.CodeMirror)
          }
        },
        {
          label: 'Hush',
          accelerator: 'CmdOrCtrl+.',
          click: () => lang.evaluate('CmdPeriod.run', true)
        },
        {
          label: 'Recompile class library',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => {
            lang.reboot()
          }
        },
        {
          label: 'Re-index documentation',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            lang.evaluate('SCDoc.indexAllDocuments(clearCache: false)')
          }
        }
      ]
    },
    {
      label: 'Server',
      submenu: [
        {
          label: 'Boot server',
          accelerator: 'CmdOrCtrl+B',
          click: () => lang.evaluate('Server.default.boot')
        },
        {
          label: 'Quit server',
          accelerator: 'CmdOrCtrl+Y',
          click: () => lang.evaluate('Server.default.quit')
        },
        {
          label: 'Reboot server',
          accelerator: 'CmdOrCtrl+R',
          click: () => lang.evaluate('Server.default.reboot')
        },
        {
          label: 'Kill all servers',
          click: () => lang.evaluate('Server.killAll')
        },
        {
          label: 'Show meter',
          accelerator: 'CmdOrCtrl+M',
          click: () => lang.evaluate('Server.default.meter')
        },
        {
          label: 'Show scope',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => lang.evaluate('Server.default.scope')
        },
        {
          label: 'Plot tree',
          accelerator: 'CmdOrCtrl+T',
          click: () => lang.evaluate('Server.default.plotTree')
        },
        {
          label: 'Start recording',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => lang.evaluate('Server.default.record')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom in',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const fontSize = parseFloat(leftPane.style.fontSize || 1) + 0.1 + 'rem'
            leftPane.style.fontSize = postPane.style.fontSize = fontSize
            mainEditor.refresh()
          }
        },
        {
          label: 'Zoom out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const fontSize = parseFloat(leftPane.style.fontSize || 1) - 0.1 + 'rem'
            leftPane.style.fontSize = postPane.style.fontSize = fontSize
            mainEditor.refresh()
          }
        },
        {
          label: 'Reset zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            leftPane.style.fontSize = postPane.style.fontSize = '1rem'
            mainEditor.refresh()
          }
        },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        { role: 'reload', accelerator: 'CmdOrCtrl+Alt+R' },
        { role: 'forcereload', accelerator: 'CmdOrCtrl+Alt+Shift+R' },
        { role: 'toggledevtools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Toggle help browser',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            helpPane.toggleAttribute('hidden')
            rightPane.toggleAttribute('hidden', helpPane.hidden && postPane.hidden)
            postPane.classList.toggle('pane--full', helpPane.hidden && !postPane.hidden)
          }
        },
        {
          label: 'Toggle post window',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            postPane.toggleAttribute('hidden')
            rightPane.toggleAttribute('hidden', helpPane.hidden && postPane.hidden)
            postPane.classList.toggle('pane--full', helpPane.hidden && !postPane.hidden)
          }
        },
        {
          label: 'Clear post window',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            postPane.querySelector('ul').innerHTML = ''
          }
        },
        {
          label: 'Dark mode',
          type: 'checkbox',
          checked: window.localStorage.getItem('dark-mode') === 'true',
          click: (menuItem) => {
            document.body.classList.toggle('dark-mode', menuItem.checked)
            iframe.contentDocument.documentElement.classList.toggle('dark-mode', menuItem.checked)
            window.localStorage.setItem('dark-mode', menuItem.checked)
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
          label: 'Lookup word under cursor',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            const focusedEditor = document.querySelector('.CodeMirror-focused') || iframe.contentDocument.querySelector('.CodeMirror-focused')
            if (focusedEditor) {
              editor.lookupWord(focusedEditor.CodeMirror)
              helpPane.removeAttribute('hidden')
              rightPane.toggleAttribute('hidden', helpPane.hidden && postPane.hidden)
              postPane.classList.toggle('pane--full', helpPane.hidden && !postPane.hidden)
            }
          }
        },
        {
          label: 'Keyboard shortcuts',
          click: () => {
            shell.openExternal('https://github.com/htor/hadron-editor/#usage')
          }
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

exports.setup = setup
