var resources = require('./resources')
var scene = require('./scene')
var devices = require('./devices')
var broker = require('./helpers/broker')

module.exports = { resources: resources, scene: scene, devices: devices, netbeast: broker}

var scan = require('./helpers/scan')

if (!process.env.NETBEAST_URL || !process.env.NETBEAST_PORT) {
  scan(function (beast) {
    process.env.NETBEAST_URL = beast[0].address
    process.env.NETBEAST_PORT = beast[0].port
  })
}
