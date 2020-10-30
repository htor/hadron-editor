const os = require('os')
const glob = require('glob')
const path = require('path')

const USERNAME = os.userInfo().username
const LOGFILE_PATH = path.resolve(os.tmpdir(), 'hadron-log.txt')
let INSTALLATION_PATH = ''
let APPSUPPORT_PATH = ''

if (process.platform === 'win32') {
  INSTALLATION_PATH = glob.sync('\\Program\ Files*\\SuperCollider*')[0] + '\\sclang.exe'
  APPSUPPORT_PATH = `C:\\Users\\${USERNAME}\\AppData\\Local\\SuperCollider\\Help`
} else if (process.platform === 'darwin') {
  INSTALLATION_PATH = glob.sync('/Applications/SuperCollider*/**/Contents/MacOS/sclang')[0]
  APPSUPPORT_PATH = `/Users/${USERNAME}/Library/Application Support/SuperCollider/Help`
}

exports.INSTALLATION_PATH = INSTALLATION_PATH
exports.APPSUPPORT_PATH = APPSUPPORT_PATH
exports.LOGFILE_PATH = LOGFILE_PATH
