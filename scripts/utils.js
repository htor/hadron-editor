const os = require('os')
const glob = require('glob')

const USERNAME = os.userInfo().username
const TEMP_PATH = os.tmpdir()
let INSTALLATION_PATH = ''
let APPSUPPORT_PATH = ''

if (process.platform === 'win32') {
  INSTALLATION_PATH = glob.sync('\\Program\ Files*\\SuperCollider*')[0] + '\\sclang.exe'
  APPSUPPORT_PATH = `C:\\Users\\${USERNAME}\\AppData\\Local\\SuperCollider\\Help`
} else if (process.platform === 'darwin') {
  INSTALLATION_PATH = '/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang'
  APPSUPPORT_PATH = `/Users/${USERNAME}/Library/Application Support/SuperCollider/Help`
}

exports.TEMP_PATH = TEMP_PATH
exports.INSTALLATION_PATH = INSTALLATION_PATH
exports.APPSUPPORT_PATH = APPSUPPORT_PATH
