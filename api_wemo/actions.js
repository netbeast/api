var request = require('request')
var Wemo = require('wemo-client')
var wemo = new Wemo()

wemo.discover(function (deviceInfo) {
  if (deviceInfo.deviceType === Wemo.DEVICE_TYPE.Bridge) {
    // Bridge solo GET
    request.post({url: 'http://localhost/resources',
    json: {
      app: 'BelkinWemo',
      location: 'all',
      topic: 'bridge',
      method: 'get',
      hook: '/wemoBridge/' + deviceInfo.macAddress
    }},
    function (err, resp, body) {
      if (err) throw err
    })
    var client = wemo.client(deviceInfo)

    client.getEndDevices(function (err, bulbs) {
      if (err) throw err
      bulbs.forEach(function (lights) {
        request.post({url: 'http://localhost/resources',
        json: {
          app: 'BelkinWemo',
          location: 'all',
          topic: 'lights',
          method: 'get',
          hook: '/wemoLights/' + lights.deviceId
        }},
        function (err, resp, body) {
          if (err) throw err
        })

        request.post({url: 'http://localhost/resources',
        json: {
          app: 'BelkinWemo',
          location: 'all',
          topic: 'lights',
          method: 'set',
          hook: '/wemoLights/' + lights.deviceId
        }},
        function (err, resp, body) {
          if (err) throw err
        })
      })
    })
  } else if ((deviceInfo.deviceType === Wemo.DEVICE_TYPE.Insight) || (deviceInfo.deviceType === Wemo.DEVICE_TYPE.Switch)) {
    request.post({url: 'http://localhost/resources',
    json: {
      app: 'BelkinWemo',
      location: 'all',
      topic: 'switch',
      method: 'get',
      hook: '/wemoSwitch/' + deviceInfo.macAddress
    }},
    function (err, resp, body) {
      if (err) throw err
      console.log(body)
    })

    request.post({url: 'http://localhost/resources',
    json: {
      app: 'BelkinWemo',
      location: 'all',
      topic: 'switch',
      method: 'set',
      hook: '/wemoSwitch/' + deviceInfo.macAddress
    }},
    function (err, resp, body) {
      if (err) throw err
      console.log(body)
    })
  } else console.log('Device not Supported yet!')
})
