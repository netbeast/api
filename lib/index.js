var resources = require('./resources')
var scene = require('./scene')
var devices = require('./devices')

module.exports = { resources: resources, scene: scene, devices: devices }

var scan = require('./helpers/scan')

if (!process.env.NETBEAST_URL || !process.env.NETBEAST_PORT) {
  scan(function (beast) {
    process.env.NETBEAST_URL = beast.address
    process.env.NETBEAST_PORT = beast.port
  })
}
