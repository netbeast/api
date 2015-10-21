'use strict'

var request = require('request')
var async = require('async')
var resource = require('./resource')

function scene (sceneid) {
  var location = 'all'

  var core = {
    // Add a device to a given scene
    addDevice: function (deviceid) {
      //  Creating a promise
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/resources?id=' + deviceid,
        function (err, resp, body) {
          if (err) reject(err)
          else {
            body = JSON.parse(body)
            var hook = body[0]['hook']
            var state = {
              status: null,
              bri: null,
              color: null
            }
            request.get('http://localhost' + hook + '?key=on', function (err, resp, body) {
              if (err) reject(err)
              else {
                state.status = body
                request.get('http://localhost' + hook + '?key=bri', function (err, resp, body) {
                  if (err) reject(err)
                  else {
                    state.bri = body
                    request.get('http://localhost' + hook + '?key=color', function (err, resp, body) {
                      if (err) reject(err)
                      else {
                        state.color = body
                        //  Registra dispositivo en la escena
                        request.post({ url: 'http://localhost:3000/scenes',
                        json: {
                          id: deviceid,
                          sceneid: sceneid,
                          location: location,
                          status: state.status,
                          bri: state.bri,
                          color: state.color
                        }},
                        function (err, resp, body) {
                          if (err) reject(err)
                          resolve(true)
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
          devices.forEach(function (device) {
            resource.set(device.id, {on: device.status, bri: device.bri, color: device.color})
          })
        })
        .cathch(function (err) {
          reject(err)
        })
      })
      return promise
    },

    //  Specified the location of the objects
    at: function (loc) {
      location = loc
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
          console.log(device)
          //  Registra dispositivo en la escena
          request.post({ url: 'http://localhost:3000/scenes',
          json: {
            id: device.id,
            sceneid: sceneid,
            location: device.location,
            status: device.on,
            bri: device.bri,
            color: device.color
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
        request.del('http://localhost:3000/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          if (err) reject(err)
          else resolve(true)
        })
      })
      return promise
    },

    //  Delete a device from a Scene
    deleteDevice: function (deviceid) {
      var promise = new Promise(function (resolve, reject) {
        request.del('http://localhost:3000/scenes?sceneid=' + sceneid + '&id=' + deviceid,
        function (err, resp, body) {
          if (err) reject(err)
          else resolve(true)
        })
      })
      return promise
    },

    //  Obtain all the details of a given Scene
    get: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/scenes?sceneid=' + sceneid,
        function (err, resp, body) {
          if (err) reject(err)
          else if (body === 'No Row Finded!') reject(body)
          else resolve(JSON.parse(body))
        })
      })
      return promise
    },

    //  Obtain all the Scene´s name already declared
    getScenes: function () {
      var promise = new Promise(function (resolve, reject) {
        request.get('http://localhost:3000/scenes?',
        function (err, resp, body) {
          if (err) reject(err)
          else if (body === 'No Row Finded!') reject(body)
          else {
            var scenes = []
            JSON.parse(body).forEach(function (id) {
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

var state = [{
  id: '12',
  location: 'all',
  on: '1',
  bri: '254',
  color: 'blue'
}]

scene().getScenes()
.then(function (data) {
  console.log('success')
  console.log(data)
})
.catch(function (data) {
  console.log('error')
  console.log(data)
})
