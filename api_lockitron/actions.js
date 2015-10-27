var request = require('request')

var accesstoken = '516ee45d870813f31cdd88d9318a02cfdac9cde41abc6551c993549abdd1ba17'

var objects = []
request.get('http://localhost:3000/resources?app=Lockitron',
function (err, resp, body) {
  if (err) throw err
  else {
    body = JSON.parse(body)
    body.forEach(function (device) {
      if (objects.indexOf(device.hook) < 0) objects.push(device.hook)
    })
  }
})

request.get({
  url: 'https://api.lockitron.com/v2/locks/',
  qs: {access_token: accesstoken}
}, function (err, response, body) {
  if (err) throw err
  else {
    var result = JSON.parse(body)

    result.forEach(function (lock) {
      var indx = objects.indexOf('/Lockitron/' + lock.id)
      if (indx >= 0) {
        objects.splice(indx, 1)
      } else {
        request.post({url: 'http://localhost:3000/resources',
        json: {
          app: 'Lockitron',
          location: 'all',
          topic: 'lock',
          groupname: 'none',
          method: 'get',
          hook: '/Lockitron/' + lock.id
        }},
        function (err, resp, body) {
          if (err) throw err
        })

        request.post({url: 'http://localhost:3000/resources',
        json: {
          app: 'Lockitron',
          location: 'all',
          topic: 'lock',
          groupname: 'none',
          method: 'set',
          hook: '/Lockitron/' + lock.id
        }},
        function (err, resp, body) {
          if (err) throw err
        })
      }
      if (objects.length > 0) {
        objects.forEach(function (hooks) {
          request.del('http://localhost:3000/resources?hook=' + hooks,
          function (err, resp, body) {
            if (err) throw err
          })
        })
      }
    })
  }
})
