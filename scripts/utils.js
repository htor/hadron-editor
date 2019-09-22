const crypto = require('crypto')
const HELPDIR = '/Applications/SuperCollider/SuperCollider.app/Contents/Resources/HelpSource'

function hash (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

exports.HELPDIR = HELPDIR
exports.hash = hash
