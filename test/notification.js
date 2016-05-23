const DASHBOARD_URL = 'localhost:8000'
process.env.NETBEAST = 'localhost:40123'
var netbeast = require("..")


var should = require('chai').should()
var expect = require('chai').expect
var mqtt = require('mqtt')
var http = require('http')
var request = require('request')
var net = require('net')
var q = require('q')


describe('MQTT methods', function () {

  var body = 'body'
  var title = 'title'

  it('send error notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().error(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())
      if (message.emphasis === 'error' && message.body === body && message.title === title) {
        done()
      }
    })
  })

  it('send info notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().info(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'info' && message.body === body && message.title === title) {
        done()
      }
    })
  }),

  it('send success notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().success(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'success' && message.body === body && message.title === title) {
        done()
      }
    })
  }),

  it('send warning notification to dashboard', function (done) {
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    client.on('connect', function () {
      client.subscribe('netbeast/push')
      netbeast().warning(body, title)
    })

    client.on('message', function (topic, message) {
      message = JSON.parse(message.toString())

      if (message.emphasis === 'warning' && message.body === body && message.title === title) {
        done()
      }
    })
  })

  it('received notification with method on', function (done) {
    var msg = {power: true, brightness: 99, hue: 200, saturation: 80}
    var client = mqtt.connect('ws://' + DASHBOARD_URL)
    setInterval(function () {
      client.publish('netbeast/topic', JSON.stringify(msg))
      client.end()
    }, 100)

    netbeast('topic').on(function (topic, message) {
      expect(message).to.eql(msg)
      done()
    })
  })
})

/*
describe('Find Method', function () {
  var a = netbeast().find()
  it('return the IP address and the port', function (done) {
    a.then(function (ip, port) {
      if (ip) {
        done()
      }
    })
  })
})*/
