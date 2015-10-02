var request = require('request')

var args = {on: 1, bri: '255'}

request.post({url: 'http://localhost/wemoLights/94103EA2B277DD8A', json: args}, function (err, resp, body) {
  console.log(err)
  console.log(body)
})

// request.get('http://localhost/wemoLights/94103EA2B277DD8A', function (err, resp, body) {
//   console.log(err)
//   console.log(body)
// })
