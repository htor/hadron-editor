const os = require('os')

const USERNAME = os.userInfo().username
const INSTALLATION_DIR = '/Applications/SuperCollider/SuperCollider.app'
const APPSUPPORT_DIR = `/Users/${USERNAME}/Library/Application Support/SuperCollider/Help`

exports.INSTALLATION_DIR = INSTALLATION_DIR
exports.APPSUPPORT_DIR = APPSUPPORT_DIR
