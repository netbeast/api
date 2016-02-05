require('./helpers/init')() // load env variables if needed or crash program

var request = require('superagent-bluebird-promise')
var Promise = require('bluebird')
var resources = require('./resources')

const HTTP_RESOURCES = process.env.NETBEAST_ROUTER_API + '/resources'
const HTTP_SCENES = process.env.NETBEAST_ROUTER_API + '/scenes'
const APP_PROXY = process.env.NETBEAST_ROUTER + '/i/'

var location = null
var sceneid = null

function scene (scid) {
  if (scid) sceneid = scid
  var core = {
    // Add a device to a given scene
    addDevice: function (deviceid) {
      return request.get(HTTP_RESOURCES).query({ id: deviceid })
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')
        var args = ['power', 'brightness', 'hue', 'saturation']
        return request.get(APP_PROXY + res.body[0].app + res.body[0].hook).query(normalizeArguments(args))
        .then(function (res) {
          //  Registra dispositivo en la escena
          var device = {
            id: deviceid,
            sceneid: sceneid,
            location: location || 'none',
            power: res.body.power,
            brightness: res.body.brightness,
            hue: res.body.hue,
            saturation: res.body.saturation
          }
          return request.post(HTTP_SCENES).send(device).promise()
        })
      })
    },

    // Apply the values saved on a Scene
    apply: function () {
      if (!sceneid) return Promise.reject('There isn´t any scene selected')
      return core.get()
      .then(function (res) {
        res.body.forEach(function (device) {
          return resources().setById(device.id, {power: device.power, brightness: device.brightness, hue: device.hue, saturation: device.saturation})
        })
      })
    },

    //  Specified the location of the objects
    at: function (loc) {
      location = loc
      return core
    },

    // Create a Scene with the current sates of the devices
    create: function (devicesid) {
      var promise = new Promise(function (resolve, reject) {
        devicesid.forEach(function (id) {
          core.addDevice(id)
          .then(function (data) {
            resolve(data)
          })
          .catch(function (data) {
            reject(data)
          })
        })
      })
      return promise
    },

    //  Create a Scene with the given sates of the devices
    createCustom: function (states) {
      return Promise.map(states, function (device, done) {
        //  Registra dispositivo en la escena
        device.sceneid = sceneid
        return request.post(HTTP_SCENES).send(device).promise()
      })
    },

    //  Delete a Scene
    delete: function () {
      return request.del(HTTP_SCENES).query({sceneid: sceneid}).promise()
    },

    //  Delete a device from a Scene
    deleteDevice: function (deviceid) {
      return request.del(HTTP_SCENES).query({sceneid: sceneid, id: deviceid}).promise()
    },

    //  Obtain all the details of a given Scene
    get: function () {
      return request.get(HTTP_SCENES).query(queryCustom()).promise()
    },

    //  Obtain all the Scene´s name already declared
    getScenes: function () {
      return request.get(HTTP_SCENES).promise()
    }
  }
  //  Adapter Pattern
  return core
}

function queryCustom (args) {
  var queryString = args || {}
  if (location) queryString.location = location
  if (sceneid) queryString.sceneid = sceneid
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
}

module.exports = scene
