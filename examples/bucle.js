var resource = require('../lib/resource')

var color = 0
setInterval(function () {
  color += 2000
  var colorHue = Math.floor(color % 65535)
  resource('lights').set({on: 1, bri: 255, hue: colorHue, sat: 255})
}, 1000)
