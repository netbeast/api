'use strict'

var request = require('request')

// Nombre del grupo y Array de acciones obtenidas de la tabla de recursos
function groupDevices (name, devices) {
  console.log(devices)
  devices.forEach(function (item) {
    request.patch({url: 'http://localhost/resources?id=' + item['id'], json: {groupname: name}}, function (err, resp, body) {
      if (err) throw err
    })
  })
}

module.exports = groupDevices
