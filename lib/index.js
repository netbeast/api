var NETBEAST = require('./helpers/init')() // load env variables if needed or crash program

// We must require tiny wrapper around superagent that
// enables it to return a promise. Call .promise() instead
// od .end() to execute a superagent request.
var request = require('superagent-bluebird-promise')
var Promise = require('bluebird')
var mqtt = require('mqtt')
var chalk = require('chalk')

var scan = require('./helpers/scan')

var location = null
var group = null
var topic = null

function netbeast (top) {
  const HTTP_API = 'http://' + NETBEAST + '/api/resources'
  const HTTP_SCENES = 'http://' + NETBEAST + '/api/scenes'
  const APP_PROXY = 'http://' + NETBEAST + '/i/'

  if (top) topic = top

  var core = {
    // Add a device to a given scene
    addDeviceScene: function (deviceid) {
      return request.get(HTTP_API).query({ id: deviceid })
      .then(function (res) {
        if (!res.body.length) return Promise.reject('These resources doesn´t exists!')
        return request.get(APP_PROXY + res.body[0].app + res.body[0].hook)
        .then(function (res) {
          //  Registra dispositivo en la escena
          var device = {
            id: deviceid,
            sceneid: topic,
            location: location,
            state: JSON.stringify(res.body)
          }
          return request.post(HTTP_SCENES).send(device).promise()
        })
      })
    },

    // Apply the values saved on a Scene
    applyScene: function () {
      if (!topic) return Promise.reject('There isn´t any scene selected')
      return core.getScene()
      .then(function (res) {
        res.body.forEach(function (device) {
          return core.setById(device.id, JSON.parse(device.state))
        })
      })
    },

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

    create: function (args) {
      if (!topic) return Promise.reject(new Error('Topic required'))
      if (!args.hook) return Promise.reject(new Error('Hook required'))
      if (!args.app) return Promise.reject(new Error('App name required'))

      var query = queryCustom(args)
      return request.post(HTTP_API)
      .send(query)
      .then(function (resp) {
        return Promise.resolve(resp.body)
      }).catch(function (err) {
        if (err) return Promise.reject(err)
      })
    },

    //  Create a Scene with the given sates of the devices
    createCustomScene: function (states) {
      return Promise.map(states, function (device, done) {
        //  Registra dispositivo en la escena
        device.sceneid = topic
        device.state = JSON.stringify(device.status)
        for (var key in device) {
          if (['id', 'sceneid', 'state'].indexOf(key) < 0) delete device[key]
        }
        return request.post(HTTP_SCENES).send(device).promise()
      })
    },

    // Create a Scene with the current sates of the devices
    createScene: function (devicesid) {
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

    //  Method that performs the delete request for a specific device
    deleteById: function (id) {
      return request.del(HTTP_API).query({ id: id }).promise()
    },

    //  Delete a device from a Scene
    deleteDeviceScene: function (deviceid) {
      return request.del(HTTP_SCENES).query({sceneid: topic, id: deviceid}).promise()
    },

    //  Delete a Scene
    deleteScene: function () {
      return request.del(HTTP_SCENES).query({sceneid: topic}).promise()
    },

    // Search for devices of a given brand (or all)
    discoverDevices: function (app) {
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
    },

    emit: function (msg) {
      // Log notification through console
      var str = chalk.bgCyan('ws') +
      chalk.bold.bgCyan(msg.title || '::')

      switch (msg.emphasis) {
        case 'error':
          str = str + chalk.bgRed(msg.body)
          break
        case 'warning':
          str = str + chalk.bgYellow(msg.body)
          break
        case 'info':
          str = str + chalk.bgBlue(msg.body)
          break
        case 'success':
          str = str + chalk.bgGreen(msg.body)
          break
      }

      var client = mqtt.connect('ws://' + process.env.NETBEAST)
      client.publish('netbeast/push', JSON.stringify(msg))
      client.end()
    },

    error: function (body, title) {
      core.emit({ emphasis: 'error', body: body, title: title })
    },

    find: function () {
      var promise = new Promise(function (resolve, reject) {
        scan(function (beast) {
          if (beast) {
            process.env.NETBEAST = beast[0].address + ':' + beast[0].port
            resolve(beast[0].address, beast[0].port)
          }
          reject()
        })
      })
      return promise
    },

    //  Method that performs the get request
    get: function (args) {
      var queryString = normalizeArguments(args)

      queryString = (queryString === undefined) ? {} : queryString
      return request.get(HTTP_API).query(queryCustom())
      .then(function (res) {
        if (!res.body.length) return Promise.reject(new Error('These resources doesn´t exists!'))
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

    //  Obtain all the Scene´s name already declared
    getAllScenes: function () {
      return request.get(HTTP_SCENES).promise()
    },

    //  Method that performs the get request for a specific device
    getById: function (id) {
      return request.get(HTTP_API).query({ id: id })
      .then(function (res) {
        if (!res.body.length) return Promise.reject(new Error('These resources doesn´t exists!'))
        var item = res.body[0]
        return request.get(APP_PROXY + item.app + item.hook)
        .then(function (res) {
          item.result = res.body
          return Promise.resolve(item)
        })
      })
    },

    //  Obtain all the details of a given Scene
    getScene: function () {
      return request.get(HTTP_SCENES).query(queryCustomScene()).promise()
    },

    //  Specified if the resource belongs to a certain group
    groupBy: function (name) {
      group = name
      return core
    },

    groupDevices: function (name, devices) {
      var promise = new Promise(function (resolve, reject) {
        devices.forEach(function (item) {
          request.patch(HTTP_API).query({id: item}).send({groupname: name}).promise()
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

    info: function (body, title) {
      core.emit({ emphasis: 'info', body: body, title: title })
    },

    on: function (callback) {
      var client = mqtt.connect('ws://' + process.env.NETBEAST)

      client.on('connect', function () {
        client.subscribe('netbeast/' + topic)
      })

      if (!topic) return Promise.reject(new Error('Topic required'))

      client.on('message', function (topic, message) {
        if (message) {
          message = JSON.parse(message.toString())
          callback(null, message)
        }
      })
    },

    //  Method that performs the set request
    set: function (args) {
      return request.get(HTTP_API).query(queryCustom())
      .then(function (res) {
        if (!res.body.length) return Promise.reject(new Error('These resources doesn´t exists!'))

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
        if (!res.body.length) return Promise.reject(new Error('These resources doesn´t exists!'))

        var item = res.body[0]
        return request.post(APP_PROXY + item.app + item.hook).send(args)
        .then(function (res) {
          item.result = (Object.keys(res.body).length) ? res.body : res.text
          return Promise.resolve(item)
        })
      })
    },

    success: function (body, title) {
      core.emit({ emphasis: 'success', body: body, title: title })
    },

    warning: function (body, title) {
      core.emit({ emphasis: 'warning', body: body, title: title })
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

function queryCustomScene (args) {
  var queryString = args || {}
  if (location) queryString.location = location
  if (topic) queryString.sceneid = topic
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

module.exports = netbeast
