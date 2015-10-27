var request = require('request')

var accesstoken = '516ee45d870813f31cdd88d9318a02cfdac9cde41abc6551c993549abdd1ba17'

// request.get({
//   url: 'http://localhost/Lockitron/4a2a5836-19c3-4ed1-b866-5e952a0f6e5a',
//   qs: {access_token: accesstoken, key: 'keys'}
// }, function (err, response, body) {
//   console.log(err)
//   var result = JSON.parse(body)
//   console.log(result)
// })

request.post({
  url: 'http://localhost/Lockitron/4a2a5836-19c3-4ed1-b866-5e952a0f6e5a',
  json: {access_token: accesstoken,
    email: 'luis@netbast.co',
    phone: '015226809392',
    name: 'Luis',
    start_date: 'FECHA',
    expiration_date: 'FECHA',
    role: 'guest',
    lock: 'on'
  }
}, function (err, response, body) {
  console.log(err)
  var result = JSON.parse(body)
  console.log(result)
})
