var resource = require('../resource')

setInterval(function () {
  var colorHue = Math.floor((Math.random() * 65535) + 1)
  resource('lights').set({on: 1, bri: 255, hue: colorHue, sat: 255})
  setTimeout(function () {
    resource('lights').set({on: 0})
  }, 7000)
}, 10000)
