var request = require('request')

var args = {on: true, bri: 253, alert: 'select'}

request.post({ url: 'http://localhost/hueLights/1', json: args }, function (err, resp, body) {
  console.log(err)
  console.log(body)
})

request.get('http://localhost/hueLights/1', function (err, resp, body) {
  console.log(err)
  console.log(body)
})
