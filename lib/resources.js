'use strict'

require('init')() // load env variables if needed or crash program

// We must require tiny wrapper around superagent that
// enables it to return a promise. Call .promise() instead
// od .end() to execute a superagent request.
var request = require('superagent-bluebird-promise')
var Promise = require('bluebird')
var async = require('async')

const HTTP_API = process.env.NETBEAST_ROUTER_API + '/resources'
const APP_PROXY = process.env.NETBEAST_ROUTER_API + '/i/'

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
      const queryString = normalizeArguments(args)
      return request.del(HTTP_API).query(queryString).promise()
    },

    //  Method that performs the delete request for a specific device
    deleteById: function (id) {
      return request.del(HTTP_API).query({ id: id }).promise()
    },

    //  Method that performs the get request
    get: function (args) {

      const queryString = normalizeArguments(args)

      return request.get(HTTP_API).query(queryString)
      .then(function (err, res) {
        if (err) return Promise.reject(err)

        // data should be directly in res.body, which must be an array
        async.map(res.body.data, function (item, done) {
          request.get(APP_PROXY + item.app + item.hook).query(queryString)
          .then(function (err, res) {
            if (err) return done(err)

            item.result = res.body
            return done(null, item)
          })
        }, function (err, results) {
          if (err) return Promise.reject(err)
          return Promise.resolve(results)
        })
      })
    },

    //  Method that performs the get request for a specific device
    getById: function (id) {
      return request.get(HTTP_API).query({ id: id }).then(function (err, res) {
        if (err) return Promise.reject(err)

        var item = res.body.data[0]
        return request.get(APP_PROXY + item.app + item.hook)
        .then(function (err, res) {
          if (err) return Promise.reject(err)

          item.result = res.body
          return Promise.resolve(item)
        })
      })
    },

    //  Specified if the resource belongs to a certain group
    groupBy: function (name) {
      group = name
      return core
    },

    //  Method that performs the set request
    set: function (args) {
      //  request.get(_dashboardUrl() + '/resources?topic=' + queryCustom(),
      return request.get(HTTP_API).query({ topic: queryCustom() })
      .then(function (err, res) {
        if (err) return Promise.reject(err)

        async.map(res.body.data, function (item, done) {
          request.post(APP_PROXY + item.app + item.hook)
          .send(args).then(function (err, res) {
            if (err) return done(err)

            item.result = res.body
            return done(null, item)
          })
        }, function (err, results) {
          if (err) return Promise.reject(err)
          return Promise.resolve(results)
        })
      })
    },

    //  Method that performs the set request  for a specific device
    setById: function (id, args) {
      //  Creating a promise
      return request.get(HTTP_API).query({id: id})
      .then(function (err, res) {
        if (err) return Promise.reject(err)

        var item = res.body.data[0]
        request.post(APP_PROXY + item.app + item.hook)
        .send(args).then(function (err, res) {
          if (err) return Promise.reject(err)

          item.result = res.body
          return Promise.resolve(item)
        })
      })
    }
  }

  //  Adapter Pattern
  return core
}

function queryCustom (args) {
  var queryString = args || {}
  if (location) queryString.location = location
  if (group) queryString.group = group
  if (topic) queryString.topic = topic
  return queryString
}

function normalizeArguments (args) {
  //  Prepare query to be an object out of args unless it is undefined
  var query = typeof args === 'undefined' ? undefined : {}
  // if it is an string turn it into an array
  args = typeof args === 'string' ? [args] : args
  // and normalize it into an object again
  if (args instanceof Array) {
    args.forEach(function (param) { query[param] = '' })
  } else if (typeof args === 'object') {
    query = args
  }

  return query
}

module.exports = resources
