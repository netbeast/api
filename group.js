'use strict'

var request = require('request')

// Nombre del grupo y Array de acciones obtenidas de la tabla de recursos
function groupDevices (name, devices) {
  devices.forEach(function (item) {
    request.patch({url: 'http://localhost/resources?id=' + item['id'], json: {groupname: name}}, function (err, resp, body) {
      if (err) throw err
    })
  })
}

function discoverDevices (app) {
  var apps = ['philips-hue', 'belkin-wemo']
  if (!app || app === 'all') {
    var appslist = []
    apps.forEach(function (item) {
      if (appslist.indexOf(item) < 0) {
        appslist.push(item)
        request.get('http://localhost/' + item + '/discover', function (err, resp, body) {
          if (err) throw err
        })
      }
    })
  } else if (apps.indexOf(app) >= 0) {
    request.get('http://localhost/' + app + '/discover', function (err, resp, body) {
      if (err) throw err
    })
  } else console.log('App not supported yet')
}

discoverDevices('belkin-wemo')
