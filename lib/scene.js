'use strict'

var request = require('request')
var async = require('async')
var resource = require('./resource')

function scene (sceneid) {
  var location = 'none'
  var textlocation = '\'none\''

  var core = {
    // Add a device to a given scene
    addDevice: function (deviceid) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/resources?id=' + deviceid,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            var hook = body.data[0]['hook']
            var app = body.data[0]['app']
            var state = {
              status: null,
              bri: null,
              hue: null,
              sat: null
            }
            request.get('http://localhost/i/' + app + hook + '?key=on', function (err, resp, body) {
              if (err) reject(err)
              else {
                body = JSON.parse(body)
                state.status = body.data
                request.get('http://localhost/i/' + app + hook + '?key=bri', function (err, resp, body) {
                  if (err) reject(err)
                  else {
                    body = JSON.parse(body)
                    state.bri = body.data
                    request.get('http://localhost/i/' + app + hook + '?key=hue', function (err, resp, body) {
                      if (err) reject(err)
                      else {
                        body = JSON.parse(body)
                        state.hue = body.data
                        request.get('http://localhost/i/' + app + hook + '?key=sat', function (err, resp, body) {
                          if (err) reject(err)
                          else {
                            body = JSON.parse(body)
                            state.sat = body.data
                            //  Registra dispositivo en la escena
                            request.post({ url: 'http://localhost/scenes',
                            json: {
                              id: deviceid,
                              sceneid: sceneid,
                              location: location,
                              status: state.status,
                              bri: state.bri,
                              hue: state.hue,
                              sat: state.sat
                            }},
                            function (err, resp, body) {
                              if (err) reject(err)
                              resolve({error: {}, data: true})
                            })
                          }
                        })
                      }
                    })
                  }
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
          devices.data.forEach(function (device) {
            resource().setById(device.id, {on: device.status, bri: device.bri, hue: device.hue, sat: device.sat})
            .then(function (data) {
              resolve({error: {}, data: true})
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

    //  Specified the location of the objects
    at: function (loc) {
      location = loc
      textlocation = 'location'
      return core
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
          console.log(device)
          request.post({ url: 'http://localhost/scenes',
          json: {
            id: device.id,
            sceneid: sceneid,
            location: device.location,
            status: device.on,
            bri: device.bri,
            hue: device.hue,
            sat: device.sat
          }},
          function (err, resp, body) {
            console.log(err)
            console.log(body)
            if (err) callback(err)
            callback(null, body)
          })
        }, function (err, results) {
          if (err) return reject(err)
          resolve({error: {}, data: true})
        })
      })
      return promise
    },

    //  Delete a Scene
    delete: function () {
      var promise = new Promise(function (resolve, reject) {
        request.del('http://localhost/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          if (err) reject(err)
          else resolve({error: {}, data: true})
        })
      })
      return promise
    },

    //  Delete a device from a Scene
    deleteDevice: function (deviceid) {
      var promise = new Promise(function (resolve, reject) {
        request.del('http://localhost/scenes?sceneid=' + sceneid + '&id=' + deviceid,
        function (err, resp, body) {
          if (err) reject(err)
          else resolve({error: {}, data: true})
        })
      })
      return promise
    },

    //  Obtain all the details of a given Scene
    get: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          body = JSON.parse(body)
          if (err) reject(err)
          else if (body.error === 'No Row Found!') reject(body.error)
          else resolve(body)
        })
      })
      return promise
    },

    //  Obtain all the Scene´s name already declared
    getScenes: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost/scenes?',
        function (err, resp, body) {
          body = JSON.parse(body)
          if (err) reject(err)
          else if (body.error === 'No Row Found!') reject({error: body.error, data: {}})
          else {
            var scenes = []
            body.data.forEach(function (id) {
              scenes.push(id['sceneid'])
            })
            resolve({error: {}, data: scenes})
          }
        })
      })
      return promise
    }

  }
  //  Adapter Pattern
  return {
    'addDevice': function (deviceid) {
      return core.addDevice(deviceid)
    },
    'apply': function () {
      return core.apply()
    },
    'at': function (loc) {
      return core.at(loc)
    },
    'create': function (devicesid) {
      return core.create(devicesid)
    },
    'createCustom': function (states) {
      return core.createCustom(states)
    },
    'delete': function () {
      return core.delete()
    },
    'deleteDevice': function (devicesid) {
      return core.deleteDevice(devicesid)
    },
    'get': function () {
      return core.get()
    },
    'getScenes': function () {
      return core.getScenes()
    }
  }
}

module.exports = scene
