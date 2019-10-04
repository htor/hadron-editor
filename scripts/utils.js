const os = require('os')

const USERNAME = os.userInfo().username
const APPSUPPORT_DIR = `/Users/${USERNAME}/Library/Application%20Support/SuperCollider/Help`

exports.APPSUPPORT_DIR = APPSUPPORT_DIR
