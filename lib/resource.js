'use strict'

var request = require('request')
var async = require('async')
var exec = require('child_process').exec

function resource (top) {
  var location = '2'
  var textlocation = '\'2\''
  var group = '3'
  var textgroup = '\'3\''
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
      textlocation = 'location'
      return core
    },

    //  Method that performs the delete request
    delete: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        if (args === undefined) {
          request.del('http://localhost/resources?' + texttopic + '=' + topic +
          '&' + textlocation + '=' + location + '&' + textgroup + '=' + group,
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
            if (key === 'id' || key === 'app' || key === 'hook') {
              q += '&' + key + '=' + args[key]
              valid = true
            }
          })
          if (valid === true) {
            request.del('http://localhost/resources?' + texttopic + '=' + topic +
            '&' + textlocation + '=' + location + '&' + textgroup + '=' + group + q,
            function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve(body)
              }
            })
          } else
            reject({error: 'Incorrect arguments', data: {}})
        }
      })

      return promise
    },

    //  Method that performs the delete request for a specific device
    deleteById: function (id) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.del('http://localhost/resources?id=' + id,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            resolve(body)
          }
        })
      })

      return promise
    },

    //  Method that performs the get request
    get: function (key) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/resources?' + texttopic + '=' + topic +
        '&' + textlocation + '=' + location + '&' + textgroup + '=' + group,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body.data, function (item, callback) {
              if (key === undefined) {
                request.get('http://localhost/i/' + item['app'] + item['hook'], function (err, resp, body) {
                  if (err) callback(err)
                  else {
                    body = JSON.parse(body)
                    callback(null, {id: item['id'], app: item['app'], topic: item['topic'], location: item['location'], result: body})
                  }
                })
              } else {
                request.get('http://localhost/i/' + item['app'] + item['hook'] + '?key=' + key, function (err, resp, body) {
                  if (err) callback(err)
                  else {
                    body = JSON.parse(body)
                    callback(null, {id: item['id'], app: item['app'], topic: item['topic'], location: item['location'], result: body})
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
    getById: function (id) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/resources?id=' + id,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            var item = body.data[0]
            request.get('http://localhost/i/' + item['app'] + item['hook'], function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve({id: item['id'], app: item['app'], topic: item['topic'], location: item['location'], result: body})
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

    //  Method that performs the set request
    set: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/resources?topic=' + topic +
        '&' + textlocation + '=' + location + '&' + textgroup + '=' + group,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            async.map(body.data, function (item, callback) {
              request.post({url: 'http://localhost/i/' + item['app'] + item['hook'], json: args}, function (err, resp, body) {
                if (err) callback(err)
                else {
                  callback(null, {id: item['id'], app: item['app'], topic: item['topic'], location: item['location'], result: body})
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
    setById: function (id, args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/resources?id=' + id,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            var item = body.data[0]
            request.post({url: 'http://localhost/i/' + item['app'] + item['hook'], json: args}, function (err, resp, body) {
              if (err) reject(err)
              else {
                resolve({id: item['id'], app: item['app'], topic: item['topic'], location: item['location'], result: body})
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
    'deleteById': function (id) {
      return core.deleteById(id)
    },
    'get': function (key) {
      return core.get(key)
    },
    'getById': function (id) {
      return core.getById(id)
    },
    'groupBy': function (name) {
      return core.groupBy(name)
    },
    'set': function (args) {
      return core.set(args)
    },
    'setById': function (id, args) {
      return core.setById(id, args)
    }
  }
}

module.exports = resource
