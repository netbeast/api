'use strict'

var request = require('request')
var scan = require('./helpers/scan')
var _dashboardUrl = require('./helpers/url')

// Nombre del grupo y Array de acciones obtenidas de la tabla de recursos
function groupDevices (name, devices) {
  var promise = new Promise(function (resolve, reject) {
    devices.forEach(function (item) {
      request.patch({url: _dashboardUrl() + '/resources?id=' + item, json: {groupname: name}}, function (err, resp, body) {
        if (err) reject(err)
        else resolve(body)
      })
    })
  })
  return promise
}
// Search for devices of a given brand (or all)
function discoverDevices (app) {
  var promise = new Promise(function (resolve, reject) {
    var apps = ['philips-hue', 'belkin-wemo']
    if (!app || app === 'all') {
      var appslist = []
      var device = []
      apps.forEach(function (item) {
        if (appslist.indexOf(item) < 0) {
          appslist.push(item)
          request.get(_dashboardUrl() + '/i/' + item + '/discover', function (err, resp, body) {
            body = JSON.parse(body)
            if (err) reject(err)
            else {
              body.data.forEach(function (item) {
                device.push(item)
              })
            }
          })
        }
      })
      setTimeout(function () {
        resolve({error: {}, data: device})
      }, 10000)
    } else if (apps.indexOf(app) >= 0) {
      request.get(_dashboardUrl() + '/i/' + app + '/discover', function (err, resp, body) {
        body = JSON.parse(body)
        if (err) reject(err)
        else resolve({error: {}, data: body.data})
      })
    } else resolve({ error: 'App not supported yet', data: {} })
  })
  return promise
}

function findBeast () {
  var promise = new Promise(function (resolve, reject) {
    scan(function (beast) {
      if (beast) {
        process.env.NETBEAST_URL = beast.address
        process.env.NETBEAST_PORT = beast.port
        resolve(beast.address, beast.port)
      } else reject()
    })
  })
  return promise
}

module.exports = { group: groupDevices, discover: discoverDevices, find: findBeast }
