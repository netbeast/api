var resource = require('../lib/resource')
var scene = require('../lib/scene')
var discoverDevices = require('../lib/devices')
var request = require('request')

var color = 90

setInterval(function () {
  var color = Math.floor(Math.random() * 360)
  resource('lights').set({brightness: 100, saturation: 100, hue: color})
  .then(function (data) {
    console.log('###  SUCCESS  ###')
    console.log(data)
  }).catch(function (data) {
    console.log('###  ERROR  ###')
    console.log(data)
  })
  console.log(color)
  color ++
}, 5000)

// var escena = [ { id: 1,
//        location: 'none',
//        on: 1,
//        bri: 254,
//        hue: 4753,
//        sat: 254 },
//        { id: 8,
//       location: 'none',
//       on: 1,
//       bri: 254
//       }
//      ]

// scene('').apply()

// scene('').get()
// .then(function (data) {
//   console.log('###  SUCCESS  ###')
//   console.log(data)
// }).catch(function (data) {
//   console.log('###  ERROR  ###')
//   console.error(data.stack)
// })

// scene('').createCustom(escena)
// .then(function (data) {
//   console.log('###  SUCCESS  ###')
//   console.log(data)
// }).catch(function (data) {
//   console.log('###  ERROR  ###')
//   console.error(data.stack)
//   console.log(data)
// })

// scene('azulito').delete()
// .then(function (data) {
//   console.log('###  SUCCESS  ###')
//   console.log(data)
// }).catch(function (data) {
//   console.log('###  ERROR  ###')
//   console.error(data.stack)
// })

// request.get('http://localhost/i/philips-hue/hueLights/1?key=hue', function (err, resp, body) {
//   console.log(err)
//   console.log(body)
// })
