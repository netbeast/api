var request = require('request')
var LifxClient = require('../lib/lifx').client
var client = new LifxClient()

client.on('light-new', function registerLight (light) {
  request.post({url: 'http://localhost:3000/resources',
  json: {
    app: 'Lifx',
    location: 'all',
    topic: 'lights',
    groupname: 'none',
    method: 'get',
    hook: '/Lifx/' + light.id
  }},
  function (err, resp, body) {
    if (err) throw err
  })

  request.post({url: 'http://localhost:3000/resources',
  json: {
    app: 'Lifx',
    location: 'all',
    topic: 'lights',
    groupname: 'none',
    method: 'set',
    hook: '/Lifx/' + light.id
  }},
  function (err, resp, body) {
    if (err) throw err
  })
})

client.on('light-online', function (light) {
  this.registerLight(light)
})

client.on('light-offline', function (light) {
  request.del('http://localhost:3000/resources?hook=/Lifx/' + light.id,
  function (err, resp, body) {
    if (err) throw err
  })
})

client.init()

client.startDiscovery()

setTimeout(function () {
  client.stopDiscovery()
}, 5000)
