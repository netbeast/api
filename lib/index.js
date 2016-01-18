var resources = require('./resources')
var scene = require('./scene')
var devices = require('./devices')

module.exports = { resources: resources, scene: scene, devices: devices }

var scan = require('./helpers/scan')

scan(function (beast) {
  console.log(beast)
  process.env.NETBEAST_URL = beast.address
  process.env.NETBEAST_PORT = beast.port
})
