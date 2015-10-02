var express = require('express')
var router = express.Router()
var Wemo = require('wemo-client')
var wemo = new Wemo()

//  Acepted Values for Each Device
var switchvalues = {on: 'binaryState'}
var bulbvalues = {on: '10006', bri: '10008'}
var bridgevalues = {on: 'binaryState'}

var devices = []

// Almacena los diferentes dispositivos
wemo.discover(function (deviceInfo) {
  devices.push(deviceInfo)
  // Si es un bridge busca las bombillas que esten conectadas a él
  if (deviceInfo.deviceType === Wemo.DEVICE_TYPE.Bridge) {
    var client = wemo.client(deviceInfo)
    client.getEndDevices(function (err, bulbs) {
      if (err) throw err
      bulbs.forEach(function (lights) {
        devices.push(lights)
      })
    })
  }
})

// ### GET ###
router.get('/wemoBridge/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.macAddress === req.params.id && elem.deviceType === Wemo.DEVICE_TYPE.Bridge) return true
  })
  if (device.length > 0) {
    if (!req.query.key) res.json(device)
    else if (bridgevalues[req.query.key])
      res.json(device[0][bridgevalues[req.query.key]])
    else
      res.status(404).send({ error: 'Value not available' })
  } else {
    res.status(404).send({ error: 'Not found' })
  }
})

router.get('/wemoLights/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.deviceId === req.params.id && elem.currentState &&
    elem.capabilities) return true
  })
  if (device.length > 0) {
    if (!req.query.key) res.json(device)
    else if (bulbvalues[req.query.key])
      res.json(device[0][bulbvalues[req.query.key]])
    else
      res.status(404).send({ error: 'Value not available' })
  } else {
    res.status(404).send({ error: 'Not found' })
  }
})

router.get('/wemoSwitch/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.macAddress === req.params.id && (elem.deviceType === Wemo.DEVICE_TYPE.Switch ||
    elem.deviceType === Wemo.DEVICE_TYPE.Insight)) return true
  })
  if (device.length > 0) {
    if (!req.query.key) res.json(device)
    else if (switchvalues[req.query.key])
      res.json(device[0][switchvalues[req.query.key]])
    else
      res.status(404).send({ error: 'Value not available' })
  } else {
    res.status(404).send({ error: 'Not found' })
  }
})

// ### POST ###
router.post('/wemoBridge/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.macAddress === req.params.id && elem.deviceType === Wemo.DEVICE_TYPE.Bridge) return true
  })
  if (device.length > 0) {
    var error = false
    var client = wemo.client(device[0])
    Object.keys(req.body).forEach(function (key) {
      if (bridgevalues[key]) {
        client.setBinaryState(req.body[key], function (err, data) {
          if (err) error = true
        })
      }
    })
    if (error === false) res.send(true)
    else res.status(404).send('A problem setting one value occurred')
  } else
    res.status(404).send({ error: 'Not found' })
})

router.post('/wemoLights/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.deviceId === req.params.id && elem.currentState &&
    elem.capabilities) return true
  })
  var bridge = devices.filter(function (elem) {
    if (elem.deviceType === Wemo.DEVICE_TYPE.Bridge) return true
  })
  if (device.length > 0 && bridge.length > 0) {
    var client = wemo.client(bridge[0])
    Object.keys(req.body).forEach(function (key) {
      // Comprobar si este valor se le puede asignar a esta bombilla
      if (bulbvalues[key]) {
        client.setDeviceStatus(req.params.id, bulbvalues[key], req.body[key])
      }
    })
    res.send(true)
  } else
    res.status(404).send({ error: 'Not found' })
})

router.post('/wemoSwitch/:id', function (req, res, next) {
  var device = devices.filter(function (elem) {
    if (elem.macAddress === req.params.id && (elem.deviceType === Wemo.DEVICE_TYPE.Switch ||
    elem.deviceType === Wemo.DEVICE_TYPE.Insight)) return true
  })
  if (device.length > 0) {
    var error = false
    var client = wemo.client(device[0])
    Object.keys(req.body).forEach(function (key) {
      if (switchvalues[key]) {
        client.setBinaryState(req.body[key], function (err, data){
          if (err) error = true
        })
      }
    })
    if (error === false) res.send(true)
    else res.status(404).send('A problem setting one value occurred')
  } else
    res.status(404).send({ error: 'Not found' })
})

module.exports = router
