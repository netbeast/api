var Promise = require('bluebird')
var request = require('superagent-bluebird-promise')
var chalk = require('chalk')
var mqtt = require('mqtt')

var scan = require('./lib/scan')

var NETBEAST = require('./lib/init')() // load env variables if needed or crash program
const HTTP_API = 'http://' + NETBEAST + '/api/resources'
const HTTP_SCENES = 'http://' + NETBEAST + '/api/scenes'
const APP_PROXY = 'http://' + NETBEAST + '/i/'

function netbeast (topic) {
  var self = {}
  self.props = {}
  self.props.topic = topic
  self.props.location = null
  self.props.group = null
  // definiciones

  // Add a device to a given scene
  self.addDeviceScene = function (deviceid) {
    return request.get(HTTP_API).query({ id: deviceid })
    .then(function (res) {
      if (!res.body.length) return Promise.reject('These resources doesn´t exists!')
      return request.get(APP_PROXY + res.body[0].app + res.body[0].hook)
      .then(function (res) {
        //  Registra dispositivo en la escena
        var device = {
          id: deviceid,
          sceneid: self.props.topic,
          location: self.props.location,
          state: JSON.stringify(res.body)
        }
        return request.post(HTTP_SCENES).send(device).promise()
      })
    })
  }

  // Apply the values saved on a Scene
  self.applyScene = function () {
    if (!self.props.topic) return Promise.reject('There isn´t any scene selected')
    return self.getScene()
    .then(function (res) {
      res.body.forEach(function (device) {
        return self.setById(device.id, JSON.parse(device.state))
      })
    })
  }

  //  Specified the location of the objects
  self.at = function (location) {
    self.props.location = location
    return self
  }

  self.changeName = function (alias) {
    if (!alias) return Promise.reject(new Error('Name required --> netbeast(<id>).changeName(<name>)'))
    if (!self.props.topic) return Promise.reject(new Error('Id required --> netbeast(<id>).changeName(<name>)'))

    return request.patch(HTTP_API + '?id=' + self.props.topic).send({alias: alias}).promise()
  }

  self.changeLocation = function (location) {
    if (!location) return Promise.reject(new Error('Location required --> netbeast(<id>).changeLocation(<location>)'))
    if (!self.props.topic) return Promise.reject(new Error('Id required --> netbeast(<id>).changeLocation(<location>)'))

    return request.patch(HTTP_API + '?id=' + self.props.topic).send({location: location}).promise()
  }

  self.create = function (args) {
    if (!self.props.topic && !args.topic) return Promise.reject(new Error('Topic required'))
    if (!args.hook) return Promise.reject(new Error('Hook required'))
    if (!args.app) return Promise.reject(new Error('App name required'))

    return request.post(HTTP_API).send(queryCustom(args)).promise()
  }

  //  Create a Scene with the given sates of the devices
  self.createCustomScene = function (states) {
    return Promise.map(states, function (device, done) {
      //  Registra dispositivo en la escena
      device.sceneid = self.props.topic
      device.state = JSON.stringify(device.status)
      for (var key in device) {
        if (['id', 'sceneid', 'state'].indexOf(key) < 0) delete device[key]
      }
      return request.post(HTTP_SCENES).send(device).promise()
    })
  }

  // Create a Scene with the current sates of the devices
  self.createScene = function (devicesid) {
    return Promise.map(devicesid, function (id) {
      self.addDeviceScene(id)
    })
  }

  //  Method that performs the delete request
  self.delete = function (args) {
    const queryString = queryCustom(normalizeArguments(args))
    return request.del(HTTP_API).query(queryString).promise()
  }

  //  Method that performs the delete request for a specific device
  self.deleteById = function (id) {
    return request.del(HTTP_API).query({ id: id }).promise()
  }

  //  Method that performs the delete request for a specific device
  self.deleteByName = function (alias) {
    return request.del(HTTP_API).query({ alias: alias }).promise()
  }

  //  Delete a device from a Scene
  self.deleteDeviceScene = function (deviceid) {
    return request.del(HTTP_SCENES).query({sceneid: self.props.topic, id: deviceid}).promise()
  }

  //  Delete a Scene
  self.deleteScene = function () {
    return request.del(HTTP_SCENES).query({sceneid: self.props.topic}).promise()
  }

  //  Method that performs the get request
  self.get = function (args) {
    if (self.props.topic === undefined) return Promise.reject(new Error('Topic required'))
    return request.get(HTTP_API + '/topic/' + self.props.topic).query(self.props).promise()
  }

  //  Obtain all the Scene´s name already declared
  self.getAllScenes = function () {
    return request.get(HTTP_SCENES).promise()
  }

  //  Method that performs the get request for a specific device
  self.getById = function (id) {
    return request.get(HTTP_API + '/id/' + id).promise()
  }

  //  Method that performs the get request for a specific device
  self.getByName = function (alias) {
    return request.get(HTTP_API + '/alias/' + alias).promise()
  }

  //  Obtain all the details of a given Scene
  self.getScene = function () {
    return request.get(HTTP_SCENES).query(queryCustomScene()).promise()
  }

  //  Specified if the resource belongs to a certain group
  self.groupBy = function (group) {
    self.props.group = group
    return self
  }

  self.groupDevices = function (name, devices) {
    return Promise.map(devices, function (item) {
      request.patch(HTTP_API).query({id: item}).send({groupname: name}).promise()
    })
  }

  self.publish = function (message) {
    var client = mqtt.connect('ws://' + process.env.NETBEAST)

    client.on('connect', function () {
      client.publish('netbeast/' + self.props.topic, JSON.stringify({message}))
    })
  }

  //  Method that performs the set request
  self.set = function (args) {
    return request.post(HTTP_API + '/topic/' + self.props.topic).query(queryCustom()).send(args).promise()
  }

  //  Method that performs the set request  for a specific device
  self.setById = function (id, args) {
    return request.post(HTTP_API + '/id/' + id).send(args).promise()
  }

  //  Method that performs the set request  for a specific device
  self.setByName = function (alias, args) {
    return request.post(HTTP_API + '/alias/' + alias).send(args).promise()
  }

  self.updateDB = function (args) {
    if (!self.props.topic && !args.topic) return Promise.reject(new Error('Topic required'))
    if (!args.hook) return Promise.reject(new Error('Hook required'))
    if (!args.app) return Promise.reject(new Error('App name required'))

    console.log(HTTP_API + '/update')
    return request.post(HTTP_API + '/update').send(queryCustom(args)).promise()
  }

  function queryCustom (args) {
    var queryString = args || {}
    if (self.props.topic) queryString.topic = self.props.topic
    if (self.props.location) queryString.location = self.props.location
    if (self.props.group) queryString.groupname = self.props.group
    return queryString
  }

  function queryCustomScene (args) {
    var queryString = args || {}
    if (self.props.location) queryString.location = self.props.location
    if (self.props.topic) queryString.sceneid = self.props.topic
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

  return self
}

netbeast.scan = function () {
  return new Promise(function (resolve, reject) {
    scan(function (beast) {
      if (beast && beast[0]) {
        netbeast.set(beast[0]) // set environment variable
        return resolve(beast)
      }

      return reject(new Error('No netbeasts found in subnet'))
    })
  })
}

netbeast.find = function () {
  if (process.env.NETBEAST) return Promise.resolve(process.env.NETBEAST)
  return netbeast.scan()
}

netbeast.set = function (networkObject) {
  process.env.NETBEAST = networkObject.address + ':' + networkObject.port.port
  return netbeast
}

netbeast.emit = function (msg) {
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
  console.log(str)
  client.publish('netbeast/push', JSON.stringify(msg))
  client.end()
}

netbeast.error = function (body, title) {
  netbeast.emit({ emphasis: 'error', body: body, title: title })
}

netbeast.info = function (body, title) {
  netbeast.emit({ emphasis: 'info', body: body, title: title })
}

netbeast.success = function (body, title) {
  netbeast.emit({ emphasis: 'success', body: body, title: title })
}

netbeast.warning = function (body, title) {
  netbeast.emit({ emphasis: 'warning', body: body, title: title })
}

netbeast.on = function (topic, callback) {
  var client = mqtt.connect('ws://' + process.env.NETBEAST)

  client.on('connect', function () {
    console.log('connected')
    client.subscribe('netbeast/' + topic)
  })

  if (!topic) return Promise.reject(new Error('Topic required'))

  client.on('message', function (topic, message) {
    console.log(message)
    if (message) {
      message = JSON.parse(message.toString())
      callback(null, message)
    }
  })
}

// Search for devices of a given brand (or all)
netbeast.discoverDevices = function (app) {
  var apps = []
  var promise = new Promise(function (resolve, reject) {
    request.get(process.env.NETBEAST + '/plugins')
    .then(function (res) {
      for (var aplication in res.body) {
        if (apps.indexOf(res.body[aplication].name) < 0) apps.push(res.body[aplication].name)
      }

      if (!app || app === 'all') {
        return Promise.each(apps, function (item) {
          request.get(APP_PROXY + item + '/discover').promise()
        })
      } else if (apps.indexOf(app) >= 0) {
        return request.get(APP_PROXY + app + '/discover')
      } else {
        return reject(new Error('App not supported yet'))
      }
    })
  })
  return promise
}

module.exports = netbeast
