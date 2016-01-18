'use strict'

var request = require('request')
var async = require('async')
var _dashboardUrl = require('./helpers/url')

var location = null
var group = null
var topic = null

function resources (top) {
  if (top) topic = top

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
          request.del(_dashboardUrl() + '/resources?' + queryCustom(),
          function (err, resp, body) {
            if (err) return reject(err)
            return resolve(body)
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
            request.del(_dashboardUrl() + '/resources?' + queryCustom() + q,
            function (err, resp, body) {
              if (err) return reject(err)
              return resolve(body)
            })
          } else return reject('Incorrect arguments')
        }
      })

      return promise
    },

    //  Method that performs the delete request for a specific device
    deleteById: function (id) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.del(_dashboardUrl() + '/resources?id=' + id,
        function (err, resp, body) {
          if (err) return reject(err)
          return resolve(body)
        })
      })

      return promise
    },

    //  Method that performs the get request
    get: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/resources?' + queryCustom(),
        function (err, resp, body) {
          if (err) return reject(err)
          body = JSON.parse(body)
          async.map(body.data, function (item, callback) {
            if (args === undefined) {
              request.get(_dashboardUrl() + '/i/' + item['app'] + item['hook'], function (err, resp, body) {
                if (err) return callback(err)

                body = JSON.parse(body)
                return callback(null, {id: item['id'],
                                      app: item['app'],
                                      topic: item['topic'],
                                      location: item['location'],
                                      result: body})
              })
            } else {
              request.get({
                url: _dashboardUrl() + '/i/' + item['app'] + item['hook'],
                qs: args
              }, function (err, resp, body) {
                if (err) return callback(err)

                body = JSON.parse(body)
                return callback(null, {id: item['id'],
                                      app: item['app'],
                                      topic: item['topic'],
                                      location: item['location'],
                                      result: body})
              })
            }
          }, function (err, results) {
            if (err) return reject(err)
            return resolve(results)
          })
        })
      })

      return promise
    },

    //  Method that performs the get request for a specific device
    getById: function (id) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/resources?id=' + id,
        function (err, resp, body) {
          if (err) return reject(err)

          body = JSON.parse(body)
          var item = body.data[0]
          request.get(_dashboardUrl() + '/i/' + item['app'] + item['hook'], function (err, resp, body) {
            if (err) return reject(err)

            return resolve({id: item['id'],
                            app: item['app'],
                            topic: item['topic'],
                            location: item['location'],
                            result: body})
          })
        })
      })
      return promise
    },

    //  Specified if the resource belongs to a certain group
    groupBy: function (name) {
      group = name
      return core
    },

    //  Method that performs the set request
    set: function (args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/resources?topic=' + queryCustom(),
        function (err, resp, body) {
          if (err) return reject(err)

          body = JSON.parse(body)
          async.map(body.data, function (item, callback) {
            request.post({url: _dashboardUrl() + '/i/' + item['app'] + item['hook'], json: args}, function (err, resp, body) {
              if (err) return callback(err)

              return callback(null, {id: item['id'],
                                    app: item['app'],
                                    topic: item['topic'],
                                    location: item['location'],
                                    result: body})
            })
          }, function (err, results) {
            if (err) return reject(err)
            return resolve(results)
          })
        })
      })

      return promise
    },

    //  Method that performs the set request  for a specific device
    setById: function (id, args) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/resources?id=' + id,
        function (err, resp, body) {
          if (err) return reject(err)

          body = JSON.parse(body)
          var item = body.data[0]
          request.post({url: _dashboardUrl() + '/i/' + item['app'] + item['hook'], json: args}, function (err, resp, body) {
            if (err) return reject(err)

            return resolve({id: item['id'],
                            app: item['app'],
                            topic: item['topic'],
                            location: item['location'],
                            result: body})
          })
        })
      })
      return promise
    }
  }

  //  Adapter Pattern
  return core
}

function queryCustom () {
  var query = ''
  var length

  if (location) length++
  if (group) length++
  if (topic) length++

  switch (length) {
    case 3:
      query += 'location=' + location + '&' + 'group=' + group + '&' + 'topic=' + topic
      break
    case 2:
      if (location) query += 'location=' + location + '&'
      if (group) query += 'group=' + group + ((!location) ? '&' : '')
      if (topic) query += 'topic=' + topic
      break
    case 1:
      if (location) query += 'location=' + location
      if (group) query += 'group=' + group
      if (topic) query += 'topic=' + topic
      break
    default:
      break
  }

  return query
}

module.exports = resources
