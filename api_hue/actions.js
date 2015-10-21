var loadBridge = require('./lights')
var request = require('request')

loadBridge(function (err, api) {
  if (err) throw err
  else {
    var objects = []
    request.get('http://localhost:3000/resources?app=PhilipsHue',
    function (err, resp, body) {
      if (err) throw err
      else {
        body = JSON.parse(body)
        body.forEach(function (device) {
          if (objects.indexOf(device.hook) < 0) objects.push(device.hook)
        })
      }
    })
    api.lights(function (err, lights) {
      if (err) throw err
      lights.lights.forEach(function (item) {
        var indx = objects.indexOf('/hueLights/' + item.id)
        if (indx >= 0) {
          objects.splice(indx, 1)
        } else {
          //  Registra una dos acciones (get y set) por cada bombilla
          request.post({url: 'http://localhost:3000/resources',
          json: {
            app: 'PhilipsHue',
            location: 'all',
            topic: 'lights',
            groupname: 'none',
            method: 'get',
            hook: '/hueLights/' + item.id
          }},
          function (err, resp, body) {
            if (err) throw err
          })

          request.post({url: 'http://localhost:3000/resources',
          json: {
            app: 'PhilipsHue',
            location: 'all',
            topic: 'lights',
            groupname: 'none',
            method: 'set',
            hook: '/hueLights/' + item.id
          }},
          function (err, resp, body) {
            if (err) throw err
          })
        }
      })
      if (objects.length > 0) {
        objects.forEach(function (hooks) {
          request.del('http://localhost:3000/resources?hook=' + hooks,
          function (err, resp, body) {
            if (err) throw err
          })
        })
      }
    })
  }
})
