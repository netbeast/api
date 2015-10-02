'use strict'

var request = require('request')
var async = require('async')

function $resource (topic) {
  var location = 'all'

  var core = {

    //  Specified the location of the objects
    at: function (loc) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        location = loc
        resolve(true)
      })
      return core
    },

    //  Method that performs the get request
    get: function (key) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?method=get&topic=' + topic +
        '&location=' + location,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body, function (item, callback) {
              if (key === undefined) {
                request.get('http://localhost' + item['hook'], function (err, resp, body) {
                  if (err) callback(err)
                  else {
                    callback(null, {id: item['id'], location: item['location'], result: body})
                  }
                })
              } else {
                request.get('http://localhost' + item['hook'] + '?key=' + key, function (err, resp, body) {
                  if (err) callback(err)
                  else {
                    callback(null, {id: item['id'], location: item['location'], result: body})
                  }
                })
              }
            }, function (err, results) {
              if (err) return reject(err)
              resolve(results)
            })
          }
        })
      })

      return promise
    },

    //  Method that performs the set request
    set: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?method=set&topic=' + topic +
        '&location=' + location, function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body, function (item, callback) {
              request.post({url: 'http://localhost' + item['hook'], json: args}, function (err, resp, body) {
                if (err) callback(err)
                else {
                  callback(null, {id: item['id'], location: item['location'], result: body})
                }
              })
            }, function (err, results) {
              if (err) return reject(err)
              resolve(results)
            })
          }
        })
      })

      return promise
    }

  }

  //  Adapter Pattern
  return {
    'get': function (key) {
      return core.get(key)
    },
    'set': function (args) {
      return core.set(args)
    },
    'at': function (loc) {
      return core.at(loc)
    }
  }
}

$resource('lights').set({on: 0, bri: 255, guapo: 12})
.then(function (data) {
  console.log('success')
  console.log(data)
})
.catch(function (data) {
  console.log('error')
  console.log(data)
})
