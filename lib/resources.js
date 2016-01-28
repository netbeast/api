
require('./helpers/init')() // load env variables if needed or crash program

// We must require tiny wrapper around superagent that
// enables it to return a promise. Call .promise() instead
// od .end() to execute a superagent request.
var request = require('superagent-bluebird-promise')
var Promise = require('bluebird')

const HTTP_API = process.env.NETBEAST_ROUTER_API + '/resources'
const APP_PROXY = process.env.NETBEAST_ROUTER + '/i/'

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
      const queryString = queryCustom(normalizeArguments(args))
      return request.del(HTTP_API).query(queryString).promise()
    },

    //  Method that performs the delete request for a specific device
    deleteById: function (id) {
      return request.del(HTTP_API).query({ id: id }).promise()
    },

    //  Method that performs the get request
    get: function (args) {
      var queryString = normalizeArguments(args)

      queryString = (queryString === undefined) ? {} : queryString
      console.log(HTTP_API)
      return request.get(HTTP_API).query(queryCustom())
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')
        // data should be directly in res.body, which must be an array
        return Promise.map(res.body, function (item, done) {
          return request.get(APP_PROXY + item.app + item.hook).query(queryString)
          .then(function (res) {
            item.result = (Object.keys(res.body).length) ? res.body : res.text
            return Promise.resolve(item)
          })
        })
      })
    },

    //  Method that performs the get request for a specific device
    getById: function (id) {
      return request.get(HTTP_API).query({ id: id })
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')
        var item = res.body[0]
        return request.get(APP_PROXY + item.app + item.hook)
        .then(function (res) {
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
      return request.get(HTTP_API).query(queryCustom())
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')

        return Promise.map(res.body, function (item, done) {
          return request.post(APP_PROXY + item.app + item.hook).send(args)
          .then(function (res) {
            item.result = (Object.keys(res.body).length) ? res.body : res.text
            return Promise.resolve(item)
          })
        })
      })
    },

    //  Method that performs the set request  for a specific device
    setById: function (id, args) {
      //  Creating a promise
      return request.get(HTTP_API).query({id: id})
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')

        var item = res.body[0]
        return request.post(APP_PROXY + item.app + item.hook).send(args)
        .then(function (res) {
          item.result = (Object.keys(res.body).length) ? res.body : res.text
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
  if (group) queryString.groupname = group
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
