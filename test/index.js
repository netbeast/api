var resource = require('../resource')
var scene = require('../scene')
var discoverDevices = require('../group')
var request = require('request')

// discoverDevices('belkin-wemo')

// resource().get()
// .then(function (data) {
//   console.log('###  SUCCESS  ###')
//   console.log(data)
// }).catch(function (data) {
//   console.log('###  ERROR  ###')
//   console.log(data)
// })

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

// scene('LUISGAY').apply()

// scene('LUISGAY').get()
// .then(function (data) {
//   console.log('###  SUCCESS  ###')
//   console.log(data)
// }).catch(function (data) {
//   console.log('###  ERROR  ###')
//   console.error(data.stack)
// })

// scene('LUISGAY').createCustom(escena)
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
