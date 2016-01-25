'use strict'

var request = require('request')
var async = require('async')
var resources = require('./resources')
var _dashboardUrl = require('helpers/url')

function scene (sceneid) {
  var core = {
    // Add a device to a given scene
    addDevice: function (deviceid) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/resources?id=' + deviceid,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            var hook = body[0].hook
            var app = body[0].app

            var args = ['power', 'brightness', 'hue', 'saturation']
            request.get({
              url: _dashboardUrl() + '/i/' + app + hook,
              qs: args
            }, function (err, resp, body) {
              if (err) reject(err)
              else {
                if (body) body = JSON.parse(body)
                //  Registra dispositivo en la escena
                var device =
                {
                  id: deviceid,
                  sceneid: sceneid,
                  location: location,
                  power: body.power,
                  brightness: body.brightness,
                  hue: body.hue,
                  saturation: body.saturation
                }
                request.post({ url: _dashboardUrl() + '/scenes',
                json: device
              }, function (err, resp, body) {
                  if (err) reject(err)
                  resolve(device)
                })
              }
            })
          }
        })
      })
      return promise
    },

    // Apply the values saved on a Scene
    apply: function () {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        core.get()
        .then(function (devices) {
          devices.forEach(function (device) {
            resources().setById(device.id, {power: device.power, brightness: device.brightness, hue: device.hue, saturation: device.saturation})
            .then(function (data) {
              resolve(true)
            }).catch(function (data) {
              reject(data)
            })
          })
        })
        .catch(function (err) {
          reject(err)
        })
      })
      return promise
    },

    // Create a Scene with the current sates of the devices
    create: function (devicesid) {
      //  Creating a promise
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
      var promise = new Promise(function (resolve, reject) {
        async.map(states, function (device, callback) {
          //  Registra dispositivo en la escena
          request.post({ url: _dashboardUrl() + '/scenes',
          json: {
            id: device.id,
            sceneid: sceneid,
            location: device.location,
            power: device.power,
            brightness: device.brightness,
            hue: device.hue,
            saturation: device.saturation
          }},
          function (err, resp, body) {
            if (err) callback(err)
            callback(null, body)
          })
        }, function (err, results) {
          if (err) return reject(err)
          resolve(true)
        })
      })
      return promise
    },

    //  Delete a Scene
    delete: function () {
      var promise = new Promise(function (resolve, reject) {
        request.del(_dashboardUrl() + '/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          if (err) return reject(err)
          resolve(true)
        })
      })
      return promise
    },

    //  Delete a device from a Scene
    deleteDevice: function (deviceid) {
      var promise = new Promise(function (resolve, reject) {
        request.del(_dashboardUrl() + '/scenes?sceneid=' + sceneid + '&id=' + deviceid,
        function (err, resp, body) {
          if (err) return reject(err)
          return resolve(true)
        })
      })
      return promise
    },

    //  Obtain all the details of a given Scene
    get: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          body = JSON.parse(body)
          if (err) reject(err)
          else if (body === 'No Row Found!') reject(body)
          else resolve(body)
        })
      })
      return promise
    },

    //  Obtain all the Scene´s name already declared
    getScenes: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get(_dashboardUrl() + '/scenes?',
        function (err, resp, body) {
          body = JSON.parse(body)
          if (err) reject(err)
          else if (body === 'No Row Found!') reject(body)
          else {
            var scenes = []
            body.data.forEach(function (id) {
              scenes.push(id['sceneid'])
            })
            resolve(scenes)
          }
        })
      })
      return promise
    }
  }
  //  Adapter Pattern
  return core
}

module.exports = scene
