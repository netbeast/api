require('./helpers/init')() // load env variables if needed or crash program

var scan = require('./helpers/scan')
var resources = require('./resources')

var request = require('superagent-bluebird-promise')
var Promise = require('bluebird')

const HTTP_RESOURCES = process.env.NETBEAST_ROUTER_API + '/resources'
const APP_PROXY = process.env.NETBEAST_ROUTER + '/i/'

// Nombre del grupo y Array de acciones obtenidas de la tabla de recursos
function groupDevices (name, devices) {
  var promise = new Promise(function (resolve, reject) {
    devices.forEach(function (item) {
      request.patch(HTTP_RESOURCES).query({id: item}).send({groupname: name}).promise()
      .then(function (data) {
        resolve(data)
      })
      .catch(function (data) {
        reject(data)
      })
    })
  })
  return promise
}
// Search for devices of a given brand (or all)
function discoverDevices (app) {
  var apps = []
  var promise = new Promise(function (resolve, reject) {
    request.get(process.env.NETBEAST_ROUTER_API + '/plugins')
    .then(function (res) {
      for (var aplication in res.body) {
        if (apps.indexOf(res.body[aplication].name) < 0) apps.push(res.body[aplication].name)
      }

      if (!app || app === 'all') {
        apps.forEach(function (item) {
          request.get(APP_PROXY + item + '/discover')
        })
        setTimeout(function () {
          return resolve(apps)
        }, 10000)
      } else if (apps.indexOf(app) >= 0) {
        return request.get(APP_PROXY + app + '/discover')
        .then(function (data) {
          return resolve(apps)
        }).catch(function (err) {
          return reject(err)
        })
      } else return reject('App not supported yet')
    })
  })
  return promise
}

function findBeast () {
  var promise = new Promise(function (resolve, reject) {
    scan(function (beast) {
      if (beast) {
        process.env.NETBEAST_URL = beast[0].address
        process.env.NETBEAST_PORT = beast[0].port
        resolve(beast[0].address, beast[0].port)
      }
      reject()
    })
  })
  return promise
}

module.exports = { group: groupDevices, discover: discoverDevices, find: findBeast }
