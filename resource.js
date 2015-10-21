'use strict'

var request = require('request')
var async = require('async')
var exec = require('child_process').exec

function resource (top) {
  var location = 'all' // DARLE UNA PENSADA A ESTO (DIFF TOPIC LOC ??)
  var group = '1'
  var textgroup = '\'1\''
  var topic = top
  var texttopic = 'topic'
  if (!top) {
    texttopic = '\'1\''
    topic = 1
  }

  var core = {

    //  Specified the location of the objects
    at: function (loc) {
      location = loc
      return core
    },

    //  Method that performs the delete request
    delete: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        if (args === undefined) {
          request.del('http://localhost:3000/resources?' + texttopic + '=' + topic +
          '&location=' + location + '&' + textgroup + '=' + group,
          function (err, resp, body) {
            if (err) reject(err)
            else {
              resolve(body)
            }
          })
        } else {
          var q = ''
          var valid = false
          Object.keys(args).forEach(function (key) {
            if (key === 'id' || key === 'app' || key === 'method' || key === 'hook') {
              q += '&' + key + '=' + args[key]
              valid = true
            }
          })
          if (valid === true) {
            request.del('http://localhost:3000/resources?' + texttopic + '=' + topic +
            '&location=' + location + '&' + textgroup + '=' + group + q,
            function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve(body)
              }
            })
          } else
            reject('Incorrect arguments')
        }
      })

      return promise
    },

    //  Method that performs the get request
    get: function (key) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?method=get&' + texttopic + '=' + topic +
        '&location=' + location + '&' + textgroup + '=' + group,
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
                    callback(null, {id: item['id'], app: item['app'], location: item['location'], result: body})
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

    //  Method that performs the get request for a specific device
    getDeviceById: function (id) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?method=get&id=' + id,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            var item = JSON.parse(body)
            request.get('http://localhost' + item['hook'], function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve({id: item['id'], location: item['location'], result: body})
              }
            })
          }
        })
      })

      return promise
    },

    //  Specified if the resource belongs to a certain group
    groupBy: function (name) {
      group = name
      textgroup = 'groupname'
      return core
    },

    //  Obtain all high and Low level devices
    obtainAll: function () {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        var items = []
        request.get('http://localhost:3000/resources',
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body, function (item, callback) {
              request.get('http://localhost' + item['hook'] + '/info', function (err, resp, body) {
                if (err) callback(err)
                else {
                  callback(null, body)
                }
              })
            }, function (err, results) {
              if (err) return reject(err)
              items.push(results)
              exec('lib/lowlevel_devices.sh', function (err, stdout, stderr) {
                if (err) reject(err)
                var devices = stdout.split('\n')
                devices.pop()
                devices.forEach(function (item) {
                  items.push({deviceName: item})
                })
                resolve(items)
              })
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
        '&location=' + location + '&' + textgroup + '=' + group,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body, function (item, callback) {
              request.post({url: 'http://localhost' + item['hook'], json: args}, function (err, resp, body) {
                if (err) callback(err)
                else {
                  callback(null, {id: item['id'], app: item['app'], location: item['location'], result: body})
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
    },

    //  Method that performs the set request  for a specific device
    setDeviceById: function (id, args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?method=set&id=' + id,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            var item = JSON.parse(body)
            request.post({url: 'http://localhost' + item['hook'], json: args}, function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve({id: item['id'], app: item['app'], location: item['location'], result: body})
              }
            })
          }
        })
      })

      return promise
    }

  }

  //  Adapter Pattern
  return {
    'at': function (loc) {
      return core.at(loc)
    },
    'delete': function (args) {
      return core.delete(args)
    },
    'get': function (key) {
      return core.get(key)
    },
    'getDeviceById': function (id) {
      return core.getDeviceById(id)
    },
    'group': function (name) {
      return core.group(name)
    },
    'groupby': function (name) {
      return core.groupby(name)
    },
    'obtainAll': function () {
      return core.obtainAll()
    },
    'set': function (args) {
      return core.set(args)
    },
    'setDeviceById': function (id, args) {
      return core.setDeviceById(id, args)
    }
  }
}

module.exports = resource

resource().obtainAll()
.then(function (data) {
  console.log('success')
  console.log(data)
})
.catch(function (data) {
  console.log('error')
  console.log(data)
})

// resource('lights').delete({id: 164, app: 'PhilipsHue'})
// .then(function (data) {
//   console.log('success')
//   console.log(data)
// })
// .catch(function (data) {
//   console.log('error')
//   console.log(data)
// })
