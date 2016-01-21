var resources = require('../lib/resource')

var color = 0
setInterval(function () {
  color += 2000
  var colorHue = Math.floor(color % 360)
  resources('lights').set({power: 1, brightness: 100, hue: colorHue, saturation: 100})
}, 1000)
