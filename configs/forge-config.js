const path = require('path')
const package = require('../package.json')

module.exports = {
  packagerConfig: {
    icon: 'images/logo',
    name: 'Hadron'
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {}
    },
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: (arch) => {
        return {
          setupExe: `Hadron-${package.version}-${arch} setup.exe`,
          setupIcon: path.resolve(__dirname, '..', 'images', 'logo.ico'),
          noMsi: true
        }
      }
    }
  ]
}
