var netbeast = require('..')


netbeast.find().then(function () {
  var color = 0
  setInterval(function () {
    color += 2000
    var colorHue = Math.floor(color % 360)
    netbeast('lights').set({power: 1, brightness: 100, hue: colorHue, saturation: 100})
  }, 1000)
})

